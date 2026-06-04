export const getPublicIdFromUrl = (url) => {
    try {
        if (!url) return null;
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        const cleanPath = parts[1].replace(/^v\d+\//, '');
        const publicId = cleanPath.substring(0, cleanPath.lastIndexOf('.'));
        
        return publicId; 
    } catch (error) {
        return null;
    }
};
