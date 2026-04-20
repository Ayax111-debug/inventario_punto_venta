import axios from 'axios';

function getCookie(name: string): string | null {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Si la cookie empieza con el nombre que buscamos...
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}



const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true, 

});



api.interceptors.request.use((config) => {
    // Si el método no es GET y tenemos la cookie csrftoken, la inyectamos
    if (config.method !== 'get') {
        const csrfToken = getCookie('csrftoken');
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config; 
        
        
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/logout/')) {
            originalRequest._retry = true; 

            try {
                await axios.post(
                    'http://localhost:8000/api/token/refresh/',
                    {}, 
                    { withCredentials: true }
                );

                return api(originalRequest);
                
            } catch (refreshError) {
                console.error("Falló la renovación de sesión:", refreshError);
                // Intentar logout para limpiar cookies
                try {
                    await api.post('/logout/');
                } catch (logoutError) {
                    console.error("Error en logout:", logoutError);
                }
                localStorage.removeItem('username');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
                
            }
        }
            
            

        return Promise.reject(error);
    }
);

export default api;