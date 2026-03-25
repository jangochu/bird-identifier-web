#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
鸟类识别 Web 应用
使用 Flask + 阿里云百炼多模态模型
"""

import os
import base64
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 最大上传 16MB
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# 确保上传目录存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# 加载配置
def load_config():
    """加载配置文件"""
    config_path = os.path.join('config', 'config.json')
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

# 阿里云百炼配置
config = load_config()
ALI_API_KEY = config.get('ALI_API_KEY', '')
MODEL = config.get('MODEL', 'qwen-vl-max')
FALLBACK_MODEL = 'qwen-vl-plus'
BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'


def identify_bird(image_base64, location=None):
    """
    调用阿里云百炼视觉模型识别鸟类
    
    Args:
        image_base64: 图片的base64编码
        location: 地区信息，包含国家和省份
    """
    if not ALI_API_KEY or ALI_API_KEY == 'your-ali-api-key-here':
        print('未配置阿里云百炼 API，返回模拟数据')
        return mock_identify_result(location)
    
    try:
        result = call_vision_model(image_base64, MODEL, location)
        return result
    except Exception as e:
        print(f'主模型调用失败: {e}，尝试备用模型')
        try:
            result = call_vision_model(image_base64, FALLBACK_MODEL, location)
            return result
        except Exception as fallback_error:
            print(f'备用模型也失败: {fallback_error}')
            return mock_identify_result(location)


def call_vision_model(image_base64, model, location=None):
    """
    调用阿里云百炼视觉模型
    
    Args:
        image_base64: 图片的base64编码
        model: 模型名称
        location: 地区信息，包含国家和省份
    """
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {ALI_API_KEY}'
    }
    
    # 构建地区提示信息
    location_hint = ""
    if location:
        country = location.get('country', {}).get('name', '')
        province = location.get('province', {}).get('name', '') if location.get('province') else ''
        if country and province:
            location_hint = f"这张照片拍摄于{country}{province}。请结合该地区的鸟类分布特征进行识别。"
        elif country:
            location_hint = f"这张照片拍摄于{country}。请结合该地区的鸟类分布特征进行识别。"
    
    prompt_text = '''这是一张什么鸟的照片？请识别这只鸟的种类，并返回以下格式的 JSON 数据（只返回 JSON，不要其他文字）：
{
  "bird_name": "鸟的中文名称",
  "scientific_name": "拉丁学名（如果有）",
  "confidence": 0.95,
  "description": "简要描述特征",
  "possible_species": [
    {"name": "最可能的鸟种", "confidence": 0.95},
    {"name": "次可能的鸟种", "confidence": 0.65},
    {"name": "第三可能的鸟种", "confidence": 0.30}
  ]
}'''
    
    # 如果有地区信息，添加到提示中
    if location_hint:
        prompt_text = location_hint + "\n\n" + prompt_text
    
    data = {
        'model': model,
        'messages': [
            {
                'role': 'user',
                'content': [
                    {
                        'type': 'image_url',
                        'image_url': {
                            'url': f'data:image/jpeg;base64,{image_base64}'
                        }
                    },
                    {
                        'type': 'text',
                        'text': prompt_text
                    }
                ]
            }
        ],
        'max_tokens': 1000
    }
    
    response = requests.post(BASE_URL, headers=headers, json=data, timeout=30)
    response.raise_for_status()
    
    result = response.json()
    if 'choices' in result and len(result['choices']) > 0:
        content = result['choices'][0]['message']['content']
        return parse_ai_response(content)
    else:
        raise Exception('API 返回格式错误')


def parse_ai_response(content):
    """
    解析 AI 返回的内容
    """
    try:
        # 尝试提取 JSON
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            data = json.loads(json_match.group())
            
            results = []
            
            # 主结果
            if 'bird_name' in data:
                results.append({
                    'name': data['bird_name'],
                    'score': data.get('confidence', 0.9)
                })
            
            # 其他可能的结果
            if 'possible_species' in data and isinstance(data['possible_species'], list):
                for species in data['possible_species']:
                    if species.get('name') and species['name'] != data.get('bird_name'):
                        results.append({
                            'name': species['name'],
                            'score': species.get('confidence', 0.5)
                        })
            
            if not results:
                results.append({
                    'name': data.get('bird_name', '未知鸟类'),
                    'score': data.get('confidence', 0.5)
                })
            
            return {
                'result': results,
                'description': data.get('description', ''),
                'raw_response': content
            }
        
        return {
            'result': [{'name': '识别结果', 'score': 0.8}],
            'description': content,
            'raw_response': content
        }
    except Exception as e:
        print(f'解析 AI 响应失败: {e}')
        return {
            'result': [{'name': '识别结果', 'score': 0.8}],
            'description': content,
            'raw_response': content
        }


def mock_identify_result(location=None):
    """
    模拟识别结果（用于开发和测试）
    
    Args:
        location: 地区信息，用于返回地区相关的模拟数据
    """
    import random
    
    # 根据地区返回不同的模拟数据
    country = location.get('country', {}).get('name', '') if location else ''
    province = location.get('province', {}).get('name', '') if location and location.get('province') else ''
    
    # 中国常见鸟类
    china_birds = [
        {'name': '麻雀', 'score': 0.95},
        {'name': '喜鹊', 'score': 0.82},
        {'name': '白头鹎', 'score': 0.67},
        {'name': '珠颈斑鸠', 'score': 0.45},
        {'name': '乌鸫', 'score': 0.23},
        {'name': '家燕', 'score': 0.78},
        {'name': '灰喜鹊', 'score': 0.56},
        {'name': '大山雀', 'score': 0.43}
    ]
    
    # 日本常见鸟类
    japan_birds = [
        {'name': '日本树莺', 'score': 0.92},
        {'name': '绿绣眼', 'score': 0.85},
        {'name': '灰椋鸟', 'score': 0.71},
        {'name': '日本山雀', 'score': 0.58},
        {'name': '丹顶鹤', 'score': 0.44}
    ]
    
    # 澳大利亚常见鸟类
    australia_birds = [
        {'name': '笑翠鸟', 'score': 0.94},
        {'name': '彩虹吸蜜鹦鹉', 'score': 0.81},
        {'name': '澳洲喜鹊', 'score': 0.69},
        {'name': '葵花凤头鹦鹉', 'score': 0.52},
        {'name': '琴鸟', 'score': 0.38}
    ]
    
    # 美国常见鸟类
    us_birds = [
        {'name': '北美红雀', 'score': 0.93},
        {'name': '蓝松鸦', 'score': 0.79},
        {'name': '旅鸫', 'score': 0.66},
        {'name': '黑顶山雀', 'score': 0.48},
        {'name': '金翅雀', 'score': 0.35}
    ]
    
    # 根据地区选择鸟类列表
    if '日本' in country:
        mock_birds = japan_birds
    elif '澳大利亚' in country or '澳洲' in country:
        mock_birds = australia_birds
    elif '美国' in country or '美國' in country:
        mock_birds = us_birds
    else:
        mock_birds = china_birds
    
    random.shuffle(mock_birds)
    
    # 构建描述信息
    location_info = ""
    if country and province:
        location_info = f"（基于{country}{province}的鸟类分布）"
    elif country:
        location_info = f"（基于{country}的鸟类分布）"
    
    return {
        'result': mock_birds[:3],
        'description': f'这是模拟数据{location_info}，请配置阿里云百炼 API Key 以获得真实识别结果',
        'isMock': True,
        'location': location
    }


@app.route('/')
def index():
    """首页"""
    return render_template('index.html')


@app.route('/api/identify', methods=['POST'])
def api_identify():
    """识别 API"""
    try:
        # 检查是否有文件上传
        if 'image' not in request.files:
            return jsonify({'error': '请上传图片'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': '请上传图片'}), 400
        
        # 读取图片并转为 base64
        image_data = file.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # 获取地区信息
        location = None
        if 'location' in request.form:
            try:
                location = json.loads(request.form['location'])
                print(f'识别地区: {location}')
            except json.JSONDecodeError:
                print('地区信息解析失败')
        
        # 保存上传的图片（可选，用于调试）
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"upload_{timestamp}.jpg"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        with open(filepath, 'wb') as f:
            f.write(image_data)
        
        # 调用识别
        result = identify_bird(image_base64, location)
        result['image_url'] = f'/static/uploads/{filename}'
        
        return jsonify(result)
    
    except Exception as e:
        print(f'识别失败: {e}')
        return jsonify({'error': f'识别失败: {str(e)}'}), 500


@app.route('/api/health')
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'ok',
        'api_configured': bool(ALI_API_KEY and ALI_API_KEY != 'your-ali-api-key-here')
    })


if __name__ == '__main__':
    print('=' * 50)
    print('🐦 鸟类识别 Web 应用')
    print('=' * 50)
    print(f'请在浏览器中访问: http://127.0.0.1:5001')
    print('=' * 50)
    app.run(debug=True, host='0.0.0.0', port=5001)
