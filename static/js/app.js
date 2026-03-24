/**
 * 鸟类识别 Web 应用前端脚本
 */

// DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const reselectBtn = document.getElementById('reselectBtn');
const identifyBtn = document.getElementById('identifyBtn');
const loadingSection = document.getElementById('loadingSection');
const resultSection = document.getElementById('resultSection');
const resultImage = document.getElementById('resultImage');
const resultList = document.getElementById('resultList');
const description = document.getElementById('description');
const mockNotice = document.getElementById('mockNotice');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const errorMessage = document.getElementById('errorMessage');
const tipsSection = document.getElementById('tipsSection');

let currentFile = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    checkHealth();
});

// 事件监听
function initEventListeners() {
    // 点击上传
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleFile(files[0]);
        } else {
            showError('请上传图片文件');
        }
    });

    // 重新选择
    reselectBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // 开始识别
    identifyBtn.addEventListener('click', identifyBird);

    // 再试一张
    tryAgainBtn.addEventListener('click', resetApp);
}

// 处理文件
function handleFile(file) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        showError('请上传图片文件（JPG、PNG 等）');
        return;
    }

    // 检查文件大小（最大 16MB）
    if (file.size > 16 * 1024 * 1024) {
        showError('图片大小不能超过 16MB');
        return;
    }

    currentFile = file;

    // 显示预览
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadSection.style.display = 'none';
        previewSection.style.display = 'block';
        resultSection.style.display = 'none';
        errorMessage.style.display = 'none';
        tipsSection.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// 识别鸟类
async function identifyBird() {
    if (!currentFile) {
        showError('请先选择图片');
        return;
    }

    // 显示加载状态
    previewSection.style.display = 'none';
    loadingSection.style.display = 'block';
    errorMessage.style.display = 'none';

    try {
        const formData = new FormData();
        formData.append('image', currentFile);

        const response = await fetch('/api/identify', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '识别失败');
        }

        const result = await response.json();
        displayResult(result);

    } catch (error) {
        console.error('识别失败:', error);
        showError(error.message || '识别失败，请检查网络连接');
        loadingSection.style.display = 'none';
        previewSection.style.display = 'block';
    }
}

// 显示结果
function displayResult(result) {
    loadingSection.style.display = 'none';
    resultSection.style.display = 'block';

    // 显示图片
    if (result.image_url) {
        resultImage.src = result.image_url;
    }

    // 显示模拟数据提示
    if (result.isMock) {
        mockNotice.style.display = 'flex';
    } else {
        mockNotice.style.display = 'none';
    }

    // 显示描述
    if (result.description) {
        description.textContent = result.description;
        description.style.display = 'block';
    } else {
        description.style.display = 'none';
    }

    // 显示结果列表
    resultList.innerHTML = '';
    if (result.result && result.result.length > 0) {
        result.result.forEach((item, index) => {
            const resultItem = createResultItem(item, index);
            resultList.appendChild(resultItem);
        });
    } else {
        resultList.innerHTML = '<div class="result-item"><p style="text-align: center; color: #999;">未识别到鸟类</p></div>';
    }
}

// 创建结果项
function createResultItem(item, index) {
    const div = document.createElement('div');
    div.className = `result-item ${index === 0 ? 'top-result' : ''}`;
    
    const score = Math.round(item.score * 100);
    
    div.innerHTML = `
        <div class="result-header">
            <span class="bird-name">${escapeHtml(item.name)}</span>
            <span class="confidence">${score}%</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
        </div>
        ${index === 0 ? '<span class="best-match">最可能匹配</span>' : ''}
    `;

    // 动画显示进度条
    setTimeout(() => {
        const fill = div.querySelector('.progress-fill');
        fill.style.width = `${score}%`;
    }, 100);

    return div;
}

// 重置应用
function resetApp() {
    currentFile = null;
    fileInput.value = '';
    
    uploadSection.style.display = 'block';
    previewSection.style.display = 'none';
    loadingSection.style.display = 'none';
    resultSection.style.display = 'none';
    errorMessage.style.display = 'none';
    tipsSection.style.display = 'block';
}

// 显示错误
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 健康检查
async function checkHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (!data.api_configured) {
            console.log('API 未配置，将使用模拟数据');
        }
    } catch (error) {
        console.error('健康检查失败:', error);
    }
}
