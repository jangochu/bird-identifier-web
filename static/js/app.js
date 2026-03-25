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
const countrySelect = document.getElementById('countrySelect');
const provinceSelect = document.getElementById('provinceSelect');

let currentFile = null;

// 地区数据 - 国家和省份映射
const locationData = {
    'CN': {
        name: '中国',
        provinces: [
            { code: 'BJ', name: '北京市' },
            { code: 'TJ', name: '天津市' },
            { code: 'HE', name: '河北省' },
            { code: 'SX', name: '山西省' },
            { code: 'NM', name: '内蒙古自治区' },
            { code: 'LN', name: '辽宁省' },
            { code: 'JL', name: '吉林省' },
            { code: 'HL', name: '黑龙江省' },
            { code: 'SH', name: '上海市' },
            { code: 'JS', name: '江苏省' },
            { code: 'ZJ', name: '浙江省' },
            { code: 'AH', name: '安徽省' },
            { code: 'FJ', name: '福建省' },
            { code: 'JX', name: '江西省' },
            { code: 'SD', name: '山东省' },
            { code: 'HA', name: '河南省' },
            { code: 'HB', name: '湖北省' },
            { code: 'HN', name: '湖南省' },
            { code: 'GD', name: '广东省' },
            { code: 'GX', name: '广西壮族自治区' },
            { code: 'HI', name: '海南省' },
            { code: 'CQ', name: '重庆市' },
            { code: 'SC', name: '四川省' },
            { code: 'GZ', name: '贵州省' },
            { code: 'YN', name: '云南省' },
            { code: 'XZ', name: '西藏自治区' },
            { code: 'SN', name: '陕西省' },
            { code: 'GS', name: '甘肃省' },
            { code: 'QH', name: '青海省' },
            { code: 'NX', name: '宁夏回族自治区' },
            { code: 'XJ', name: '新疆维吾尔自治区' },
            { code: 'TW', name: '台湾省' },
            { code: 'HK', name: '香港特别行政区' },
            { code: 'MO', name: '澳门特别行政区' }
        ]
    },
    'JP': {
        name: '日本',
        provinces: [
            { code: 'Hokkaido', name: '北海道' },
            { code: 'Tohoku', name: '东北地区' },
            { code: 'Kanto', name: '关东地区' },
            { code: 'Chubu', name: '中部地区' },
            { code: 'Kinki', name: '近畿地区' },
            { code: 'Chugoku', name: '中国地区' },
            { code: 'Shikoku', name: '四国地区' },
            { code: 'Kyushu', name: '九州地区' },
            { code: 'Okinawa', name: '冲绳县' }
        ]
    },
    'KR': {
        name: '韩国',
        provinces: [
            { code: 'Seoul', name: '首尔特别市' },
            { code: 'Busan', name: '釜山广域市' },
            { code: 'Gyeonggi', name: '京畿道' },
            { code: 'Gangwon', name: '江原道' },
            { code: 'Chungcheong', name: '忠清道' },
            { code: 'Jeolla', name: '全罗道' },
            { code: 'Gyeongsang', name: '庆尚道' },
            { code: 'Jeju', name: '济州特别自治道' }
        ]
    },
    'IN': {
        name: '印度',
        provinces: [
            { code: 'Delhi', name: '德里' },
            { code: 'Maharashtra', name: '马哈拉施特拉邦' },
            { code: 'Karnataka', name: '卡纳塔克邦' },
            { code: 'Tamil', name: '泰米尔纳德邦' },
            { code: 'Uttar', name: '北方邦' },
            { code: 'West', name: '西孟加拉邦' },
            { code: 'Gujarat', name: '古吉拉特邦' },
            { code: 'Rajasthan', name: '拉贾斯坦邦' },
            { code: 'Kerala', name: '喀拉拉邦' },
            { code: 'Punjab', name: '旁遮普邦' }
        ]
    },
    'TH': {
        name: '泰国',
        provinces: [
            { code: 'Bangkok', name: '曼谷' },
            { code: 'ChiangMai', name: '清迈府' },
            { code: 'Phuket', name: '普吉府' },
            { code: 'Krabi', name: '甲米府' },
            { code: 'Chonburi', name: '春武里府' },
            { code: 'Ayutthaya', name: '大城府' },
            { code: 'Northern', name: '北部地区' },
            { code: 'Northeastern', name: '东北地区' },
            { code: 'Central', name: '中部地区' },
            { code: 'Southern', name: '南部地区' }
        ]
    },
    'VN': {
        name: '越南',
        provinces: [
            { code: 'Hanoi', name: '河内市' },
            { code: 'HCMC', name: '胡志明市' },
            { code: 'DaNang', name: '岘港市' },
            { code: 'Northern', name: '北部地区' },
            { code: 'Central', name: '中部地区' },
            { code: 'Southern', name: '南部地区' },
            { code: 'Mekong', name: '湄公河三角洲' }
        ]
    },
    'MY': {
        name: '马来西亚',
        provinces: [
            { code: 'KualaLumpur', name: '吉隆坡' },
            { code: 'Selangor', name: '雪兰莪州' },
            { code: 'Penang', name: '槟城州' },
            { code: 'Johor', name: '柔佛州' },
            { code: 'Sabah', name: '沙巴州' },
            { code: 'Sarawak', name: '砂拉越州' },
            { code: 'Malacca', name: '马六甲州' },
            { code: 'Perak', name: '霹雳州' }
        ]
    },
    'PH': {
        name: '菲律宾',
        provinces: [
            { code: 'Manila', name: '马尼拉' },
            { code: 'Cebu', name: '宿务省' },
            { code: 'Luzon', name: '吕宋岛' },
            { code: 'Visayas', name: '米沙鄢群岛' },
            { code: 'Mindanao', name: '棉兰老岛' },
            { code: 'Palawan', name: '巴拉望省' }
        ]
    },
    'ID': {
        name: '印度尼西亚',
        provinces: [
            { code: 'Jakarta', name: '雅加达' },
            { code: 'Bali', name: '巴厘岛' },
            { code: 'Java', name: '爪哇岛' },
            { code: 'Sumatra', name: '苏门答腊岛' },
            { code: 'Sulawesi', name: '苏拉威西岛' },
            { code: 'Kalimantan', name: '加里曼丹岛' },
            { code: 'Papua', name: '巴布亚省' }
        ]
    },
    'AU': {
        name: '澳大利亚',
        provinces: [
            { code: 'NSW', name: '新南威尔士州' },
            { code: 'VIC', name: '维多利亚州' },
            { code: 'QLD', name: '昆士兰州' },
            { code: 'WA', name: '西澳大利亚州' },
            { code: 'SA', name: '南澳大利亚州' },
            { code: 'TAS', name: '塔斯马尼亚州' },
            { code: 'ACT', name: '首都领地' },
            { code: 'NT', name: '北领地' }
        ]
    },
    'NZ': {
        name: '新西兰',
        provinces: [
            { code: 'NorthIsland', name: '北岛' },
            { code: 'SouthIsland', name: '南岛' },
            { code: 'Auckland', name: '奥克兰大区' },
            { code: 'Wellington', name: '惠灵顿大区' },
            { code: 'Canterbury', name: '坎特伯雷大区' }
        ]
    },
    'US': {
        name: '美国',
        provinces: [
            { code: 'CA', name: '加利福尼亚州' },
            { code: 'TX', name: '德克萨斯州' },
            { code: 'NY', name: '纽约州' },
            { code: 'FL', name: '佛罗里达州' },
            { code: 'WA', name: '华盛顿州' },
            { code: 'Northeast', name: '东北部' },
            { code: 'Southeast', name: '东南部' },
            { code: 'Midwest', name: '中西部' },
            { code: 'Southwest', name: '西南部' },
            { code: 'West', name: '西部' }
        ]
    },
    'CA': {
        name: '加拿大',
        provinces: [
            { code: 'ON', name: '安大略省' },
            { code: 'BC', name: '不列颠哥伦比亚省' },
            { code: 'QC', name: '魁北克省' },
            { code: 'AB', name: '艾伯塔省' },
            { code: 'Eastern', name: '东部地区' },
            { code: 'Western', name: '西部地区' },
            { code: 'Northern', name: '北部地区' }
        ]
    },
    'GB': {
        name: '英国',
        provinces: [
            { code: 'England', name: '英格兰' },
            { code: 'Scotland', name: '苏格兰' },
            { code: 'Wales', name: '威尔士' },
            { code: 'NorthernIreland', name: '北爱尔兰' }
        ]
    },
    'DE': {
        name: '德国',
        provinces: [
            { code: 'Bavaria', name: '巴伐利亚州' },
            { code: 'Berlin', name: '柏林' },
            { code: 'North', name: '北莱茵-威斯特法伦州' },
            { code: 'Baden', name: '巴登-符腾堡州' },
            { code: 'Hesse', name: '黑森州' },
            { code: 'Northern', name: '北部地区' },
            { code: 'Southern', name: '南部地区' },
            { code: 'Eastern', name: '东部地区' },
            { code: 'Western', name: '西部地区' }
        ]
    },
    'FR': {
        name: '法国',
        provinces: [
            { code: 'Paris', name: '巴黎大区' },
            { code: 'Provence', name: '普罗旺斯-阿尔卑斯-蓝色海岸大区' },
            { code: 'Alsace', name: '大东部大区' },
            { code: 'Brittany', name: '布列塔尼大区' },
            { code: 'Normandy', name: '诺曼底大区' },
            { code: 'Northern', name: '北部地区' },
            { code: 'Southern', name: '南部地区' }
        ]
    },
    'OTHER': {
        name: '其他',
        provinces: [
            { code: 'Unknown', name: '未知地区' }
        ]
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initLocationSelector();
    checkHealth();
});

// 初始化地区选择器
function initLocationSelector() {
    // 国家选择变化时更新省份选项
    countrySelect.addEventListener('change', updateProvinceOptions);
    
    // 初始化省份选项（默认中国）
    updateProvinceOptions();
}

// 更新省份选项
function updateProvinceOptions() {
    const countryCode = countrySelect.value;
    const countryData = locationData[countryCode];
    
    // 清空省份选项
    provinceSelect.innerHTML = '';
    
    if (countryData && countryData.provinces) {
        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = `-- 选择${countryData.name}的省份/地区 --`;
        provinceSelect.appendChild(defaultOption);
        
        // 添加省份选项
        countryData.provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province.code;
            option.textContent = province.name;
            provinceSelect.appendChild(option);
        });
        
        provinceSelect.disabled = false;
    } else {
        // 没有数据时禁用省份选择
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '-- 请先选择国家 --';
        provinceSelect.appendChild(option);
        provinceSelect.disabled = true;
    }
}

// 获取当前选择的地区信息
function getSelectedLocation() {
    const countryCode = countrySelect.value;
    const provinceCode = provinceSelect.value;
    
    if (!countryCode) {
        return null;
    }
    
    const countryData = locationData[countryCode];
    const provinceData = countryData.provinces.find(p => p.code === provinceCode);
    
    return {
        country: {
            code: countryCode,
            name: countryData.name
        },
        province: provinceData ? {
            code: provinceCode,
            name: provinceData.name
        } : null
    };
}

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
        
        // 添加地区信息
        const location = getSelectedLocation();
        if (location) {
            formData.append('location', JSON.stringify(location));
        }

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
