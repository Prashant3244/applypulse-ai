/* ExtensionPay.js - Client library for Stripe monetization in Chrome Extensions */
function ExtPay(extensionId) {
    const EXT_ID = extensionId;
    const API_URL = 'https://extensionpay.com/api';

    async function getUser() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['applypulse_user', 'applypulse_dev_mode', 'applypulse_dev_is_pro'], (data) => {
                if (data.applypulse_dev_mode && data.applypulse_dev_is_pro !== undefined) {
                    return resolve({
                        paid: data.applypulse_dev_is_pro,
                        installedAt: new Date().toISOString(),
                        subscriptionStatus: data.applypulse_dev_is_pro ? 'active' : null
                    });
                }
                if (data.applypulse_user) {
                    resolve(data.applypulse_user);
                } else {
                    resolve({ paid: false, installedAt: new Date().toISOString() });
                }
            });
        });
    }

    function openPaymentPage() {
        const url = `https://extensionpay.com/extension/${EXT_ID}`;
        chrome.tabs.create({ url });
    }

    function openLoginPage() {
        const url = `https://extensionpay.com/extension/${EXT_ID}`;
        chrome.tabs.create({ url });
    }

    return {
        getUser,
        openPaymentPage,
        openLoginPage
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExtPay;
}
