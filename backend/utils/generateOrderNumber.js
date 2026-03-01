const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${timestamp.slice(-8)}${random}`;
};

export default generateOrderNumber;
