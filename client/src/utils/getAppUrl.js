export const getAppUrl = () => import.meta.env.VITE_APP_URL || window.location.origin;

export default getAppUrl;
