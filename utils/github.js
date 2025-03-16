const axios = require('axios');

/**
 * Создает экземпляр axios с базовыми настройками для GitHub API
 * @param {string} token - GitHub токен
 * @returns {Object} - Настроенный экземпляр axios
 */
const createGitHubClient = (token) => {
  return axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });
};

/**
 * Кодирует содержимое в base64
 * @param {string} content - Содержимое для кодирования
 * @returns {string} - Закодированное содержимое
 */
const encodeContent = (content) => {
  return Buffer.from(content).toString('base64');
};

/**
 * Декодирует содержимое из base64
 * @param {string} content - Закодированное содержимое
 * @returns {string} - Декодированное содержимое
 */
const decodeContent = (content) => {
  return Buffer.from(content, 'base64').toString('utf8');
};

/**
 * Обрабатывает ошибки API GitHub
 * @param {Error} error - Объект ошибки
 * @returns {Object} - Объект с информацией об ошибке
 */
const handleGitHubError = (error) => {
  if (error.response) {
    // Ошибка от GitHub API
    return {
      status: error.response.status,
      message: error.response.data.message || 'Ошибка GitHub API',
      errors: error.response.data.errors || []
    };
  } else if (error.request) {
    // Ошибка сети
    return {
      status: 500,
      message: 'Не удалось подключиться к GitHub API',
      errors: []
    };
  } else {
    // Другие ошибки
    return {
      status: 500,
      message: error.message || 'Неизвестная ошибка',
      errors: []
    };
  }
};

module.exports = {
  createGitHubClient,
  encodeContent,
  decodeContent,
  handleGitHubError
}; 