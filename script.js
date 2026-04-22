// script.js - TradingPsych Lab Landing Page
// الإيميل أولاً → الترخيص → التحميل (Pro فقط)

// ========== Telegram Notifications (بتشفير بسيط) ==========
const ENCRYPTED_BOT_TOKEN = 'ODY3NTQ2OTI4MjpBQUhzWlNYdzZMcm9IRVJYV2NWRUctT01HdTVpUTV4T2tCcw==';
const TELEGRAM_CHAT_ID = '5722264784';

// دالة فك التشفير
function decryptToken(encrypted) {
    try {
        return atob(encrypted);
    } catch (e) {
        console.error('فشل فك تشفير التوكن');
        return '';
    }
}

// دالة إرسال إشعار تيليجرام
async function sendTelegramNotification(email, plan) {
    const BOT_TOKEN = decryptToken(ENCRYPTED_BOT_TOKEN);
    
    if (!BOT_TOKEN) {
        console.warn('⚠️ توكن تيليجرام غير موجود');
        return;
    }
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-SA');
    const timeStr = now.toLocaleTimeString('ar-SA');
    
    const message = `🆕 تسجيل جديد!\n\n📧 البريد: ${email}\n📦 الباقة: ${plan}\n📅 التاريخ: ${dateStr}\n⏰ الوقت: ${timeStr}`;
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        if (data.ok) {
            console.log('✅ Telegram notification sent');
        } else {
            console.log('❌ Telegram notification failed:', data.description);
        }
    } catch (error) {
        console.log('❌ Telegram notification error:', error);
    }
}

// روابط التحميل المباشرة
const DOWNLOAD_URLS = {
    'Pro': 'https://github.com/Hichemorca/trading-psych-releases/raw/main/TradingPsychLab_Pro.exe',
    'Elite': 'https://github.com/Hichemorca/trading-psych-releases/raw/main/TradingPsychLab_Elite.exe',
    'Ultimate': 'https://github.com/Hichemorca/trading-psych-releases/raw/main/TradingPsychLab_Ultimate.exe'
};

// مفاتيح ترخيص تجريبية (7 أيام) - Pro فقط
const TRIAL_LICENSE_KEYS = {
    'Pro': 'UHJvfHRlc3QyMjU1QGdtYWlsLmNvbXwyMDI2LTA0LTIyfDIwMjYtMDQtMjl8QU5ZfFNUQU5EQVJEfE5PTkV8NDM5ZjhhYTZjZTYxYTQzZQ=='
};

// متغير لتخزين الباقة المختارة مؤقتاً
let selectedPlan = 'Pro';
let pendingDownloadUrl = null;

// عندما يضغط المستخدم على زر الباقة
function selectPlan(plan) {
    selectedPlan = plan;
    document.getElementById('selectedPlanInput').value = plan;
    
    if (plan === 'Pro') {
        const emailInput = document.getElementById('emailInput');
        
        // تحديث placeholder
        emailInput.placeholder = `أدخل بريدك الإلكتروني لتحميل نسخة ${plan} التجريبية`;
        
        // تمرير إلى القسم
        const ctaSection = document.querySelector('.cta');
        if (ctaSection) {
            ctaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // التركيز على حقل الإيميل بعد التمرير
        setTimeout(() => {
            emailInput.focus();
        }, 600);
        
        setTimeout(() => {
            alert(`📧 الرجاء إدخال بريدك الإلكتروني أولاً للحصول على مفتاح الترخيص.\n\nبعد ذلك سيبدأ تحميل نسخة ${plan} تلقائياً.`);
        }, 300);
    } else {
        openPurchaseModal(plan);
    }
}

// معالجة نموذج التسجيل
document.getElementById('trialForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    const plan = selectedPlan;
    
    if (!email) {
        alert('❌ الرجاء إدخال بريدك الإلكتروني أولاً.');
        return;
    }
    
    // إرسال إشعار تيليجرام
    sendTelegramNotification(email, plan);
    
    if (plan === 'Pro') {
        const licenseKey = TRIAL_LICENSE_KEYS['Pro'] || '';
        const downloadUrl = DOWNLOAD_URLS['Pro'];
        
        showLicenseModal(email, licenseKey, plan, downloadUrl);
    } else {
        openPurchaseModal(plan);
    }
    
    this.reset();
    document.getElementById('selectedPlanInput').value = 'Pro';
    selectedPlan = 'Pro';
    document.getElementById('emailInput').placeholder = 'أدخل بريدك الإلكتروني';
    
    localStorage.setItem('hasSubscribed', 'true');
    closePurchaseModal();
});

// تأثيرات التمرير
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(10, 14, 39, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'transparent';
        header.style.backdropFilter = 'none';
    }
});

// ========== License Key Modal ==========

let currentLicenseKey = '';

function showLicenseModal(email, licenseKey, plan, downloadUrl) {
    currentLicenseKey = licenseKey;
    pendingDownloadUrl = downloadUrl;
    
    document.getElementById('licenseModalEmail').innerHTML = `✅ شكراً <strong>${email}</strong>!<br>نسخة ${plan} التجريبية جاهزة.`;
    document.getElementById('licenseKeyInput').value = licenseKey;
    document.getElementById('licenseModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeLicenseModal() {
    document.getElementById('licenseModal').classList.remove('show');
    document.body.style.overflow = '';
    
    if (pendingDownloadUrl) {
        setTimeout(() => {
            window.location.href = pendingDownloadUrl;
            pendingDownloadUrl = null;
        }, 300);
    }
}

function copyLicenseKey() {
    const input = document.getElementById('licenseKeyInput');
    input.select();
    input.setSelectionRange(0, 99999);
    
    try {
        navigator.clipboard.writeText(input.value).then(() => {
            const btn = document.querySelector('#licenseModal .btn-primary');
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '✅ تم النسخ!';
                btn.style.background = '#4caf50';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                }, 2000);
            }
        }).catch(() => {
            document.execCommand('copy');
            const btn = document.querySelector('#licenseModal .btn-primary');
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '✅ تم النسخ!';
                btn.style.background = '#4caf50';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                }, 2000);
            }
        });
    } catch (err) {
        alert('فشل النسخ. الرجاء نسخ المفتاح يدوياً.');
    }
}

// ========== PURCHASE MODAL ==========

let modalSelectedPlan = 'Pro';

function openPurchaseModal(preselectedPlan) {
    modalSelectedPlan = preselectedPlan || 'Pro';
    
    const titleEl = document.getElementById('modalTitle');
    const descEl = document.getElementById('modalDescription');
    
    const titles = {
        'Pro': '🎯 جاهز للاحتراف؟',
        'Elite': '🚀 ارتقِ إلى Elite',
        'Ultimate': '🤖 ارتقِ إلى Ultimate'
    };
    
    const descriptions = {
        'Pro': '<strong>اختر باقتك المناسبة</strong><br>ارتقِ بتداولك مع إحدى باقاتنا المميزة:',
        'Elite': '<strong>Elite تمنحك حماية متكاملة</strong><br>غرفة تداول صامتة، Circuit Breaker، وقفل الهدف والخسارة:',
        'Ultimate': '<strong>Ultimate مع الذكاء الاصطناعي</strong><br>AI Predictor، تحليل أنماط الخسارة، توصيات مخصصة:'
    };
    
    if (titleEl) titleEl.textContent = titles[modalSelectedPlan] || titles['Pro'];
    if (descEl) descEl.innerHTML = descriptions[modalSelectedPlan] || descriptions['Pro'];

    document.querySelectorAll('.modal-plan').forEach(card => {
        card.classList.remove('selected');
        const name = card.querySelector('.modal-plan-name');
        if (name && name.textContent.trim() === modalSelectedPlan) {
            card.classList.add('selected');
        }
    });

    const discountMsgs = {
        'Pro':      '⚡ خصم 20% على Pro لأول شهر!',
        'Elite':    '⚡ خصم 20% على Elite + استشارة مجانية!',
        'Ultimate': '⚡ خصم 20% على Ultimate + دعم VIP!'
    };
    const noteEl = document.getElementById('modalNote');
    if (noteEl) noteEl.textContent = discountMsgs[modalSelectedPlan] || discountMsgs['Pro'];

    updateWhatsAppLink(modalSelectedPlan);
    
    document.getElementById('purchaseModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closePurchaseModal() {
    document.getElementById('purchaseModal').classList.remove('show');
    document.body.style.overflow = '';
}

function selectModalPlan(plan) {
    modalSelectedPlan = plan;

    document.querySelectorAll('.modal-plan').forEach(p => p.classList.remove('selected'));
    if (event && event.currentTarget) event.currentTarget.classList.add('selected');
    
    const titles = {
        'Pro': '🎯 جاهز للاحتراف؟',
        'Elite': '🚀 ارتقِ إلى Elite',
        'Ultimate': '🤖 ارتقِ إلى Ultimate'
    };
    const titleEl = document.getElementById('modalTitle');
    if (titleEl) titleEl.textContent = titles[plan] || titles['Pro'];
    
    const descriptions = {
        'Pro': '<strong>اختر باقتك المناسبة</strong><br>ارتقِ بتداولك مع إحدى باقاتنا المميزة:',
        'Elite': '<strong>Elite تمنحك حماية متكاملة</strong><br>غرفة تداول صامتة، Circuit Breaker، وقفل الهدف والخسارة:',
        'Ultimate': '<strong>Ultimate مع الذكاء الاصطناعي</strong><br>AI Predictor، تحليل أنماط الخسارة، توصيات مخصصة:'
    };
    const descEl = document.getElementById('modalDescription');
    if (descEl) descEl.innerHTML = descriptions[plan] || descriptions['Pro'];

    const discountMsgs = {
        'Pro':      '⚡ خصم 20% على Pro لأول شهر!',
        'Elite':    '⚡ خصم 20% على Elite + استشارة مجانية!',
        'Ultimate': '⚡ خصم 20% على Ultimate + دعم VIP!'
    };
    const noteEl = document.getElementById('modalNote');
    if (noteEl) noteEl.textContent = discountMsgs[plan] || discountMsgs['Pro'];

    updateWhatsAppLink(plan);
}

function updateWhatsAppLink(plan) {
    const btn = document.getElementById('modalWhatsappBtn');
    if (!btn) return;
    const phone = '213795589513';
    const msgs = {
        'Pro':      'السلام عليكم، أرغب في شراء اشتراك Pro مع خصم 20%',
        'Elite':    'السلام عليكم، أرغب في شراء اشتراك Elite مع خصم 20%',
        'Ultimate': 'السلام عليكم، أرغب في شراء اشتراك Ultimate مع خصم 20%'
    };
    btn.href = `https://wa.me/${phone}?text=${encodeURIComponent(msgs[plan] || msgs['Pro'])}`;
}

// إغلاق النوافذ بالضغط خارجها
document.addEventListener('click', function(e) {
    if (e.target === document.getElementById('purchaseModal')) closePurchaseModal();
    if (e.target === document.getElementById('licenseModal')) closeLicenseModal();
});

// إغلاق بـ ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePurchaseModal();
        closeLicenseModal();
    }
});

// ظهور تلقائي بعد 30 ثانية
setTimeout(function() {
    const seen = localStorage.getItem('hasSeenPurchaseModal');
    const subscribed = localStorage.getItem('hasSubscribed');
    const lastVisit = parseInt(localStorage.getItem('lastVisitTs') || '0');
    const now = Date.now();
    const anHour = 3600000;

    if (!subscribed && (!seen || (now - lastVisit) > anHour)) {
        openPurchaseModal('Elite');
        localStorage.setItem('hasSeenPurchaseModal', 'true');
        localStorage.setItem('lastVisitTs', now.toString());
    }
}, 30000);

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ TradingPsych Lab - Landing Page Loaded');

    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            faqItems.forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });
    
    const form = document.getElementById('trialForm');
    if (form) {
        form.addEventListener('submit', function() {
            localStorage.setItem('hasSubscribed', 'true');
            closePurchaseModal();
        });
    }
});

window.addEventListener('beforeunload', function() {
    if (!localStorage.getItem('hasSubscribed')) {
        const lastVisit = parseInt(localStorage.getItem('lastVisitTs') || '0');
        if ((Date.now() - lastVisit) > 3600000) {
            localStorage.removeItem('hasSeenPurchaseModal');
        }
        localStorage.setItem('lastVisitTs', Date.now().toString());
    }
});