
const Utils = {
    generateId: () => '_' + Math.random().toString(36).substr(2, 9),
    sanitize: (str) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
};
