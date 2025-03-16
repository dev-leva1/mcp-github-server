const express = require('express');
const router = express.Router();
const { createGitHubClient, encodeContent, decodeContent, handleGitHubError } = require('../utils/github');

// Получение списка репозиториев пользователя
router.get('/repos/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const githubClient = createGitHubClient(process.env.GITHUB_TOKEN);
    
    const response = await githubClient.get(`/users/${username}/repos`);
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка при получении репозиториев:', error.message);
    const errorInfo = handleGitHubError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// Получение информации о конкретном репозитории
router.get('/repos/:username/:repo', async (req, res) => {
  try {
    const { username, repo } = req.params;
    const githubClient = createGitHubClient(process.env.GITHUB_TOKEN);
    
    const response = await githubClient.get(`/repos/${username}/${repo}`);
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка при получении информации о репозитории:', error.message);
    const errorInfo = handleGitHubError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// Получение содержимого файла из репозитория
router.get('/repos/:username/:repo/contents/:path(*)', async (req, res) => {
  try {
    const { username, repo, path } = req.params;
    const githubClient = createGitHubClient(process.env.GITHUB_TOKEN);
    
    const response = await githubClient.get(`/repos/${username}/${repo}/contents/${path}`);
    
    // Если это файл, декодируем содержимое
    if (!Array.isArray(response.data) && response.data.content) {
      response.data.decodedContent = decodeContent(response.data.content);
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка при получении содержимого файла:', error.message);
    const errorInfo = handleGitHubError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// Создание нового репозитория
router.post('/repos', async (req, res) => {
  try {
    const { name, description, private: isPrivate } = req.body;
    const githubClient = createGitHubClient(process.env.GITHUB_TOKEN);
    
    const response = await githubClient.post('/user/repos', {
      name,
      description,
      private: isPrivate || false
    });
    
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Ошибка при создании репозитория:', error.message);
    const errorInfo = handleGitHubError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// Создание нового файла в репозитории
router.post('/repos/:username/:repo/contents/:path(*)', async (req, res) => {
  try {
    const { username, repo, path } = req.params;
    const { content, message } = req.body;
    const githubClient = createGitHubClient(process.env.GITHUB_TOKEN);
    
    // Кодируем содержимое в base64
    const contentEncoded = encodeContent(content);
    
    const response = await githubClient.put(`/repos/${username}/${repo}/contents/${path}`, {
      message: message || `Add ${path}`,
      content: contentEncoded
    });
    
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Ошибка при создании файла:', error.message);
    const errorInfo = handleGitHubError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// Получение списка веток репозитория
router.get('/repos/:username/:repo/branches', async (req, res) => {
  try {
    const { username, repo } = req.params;
    const githubClient = createGitHubClient(process.env.GITHUB_TOKEN);
    
    const response = await githubClient.get(`/repos/${username}/${repo}/branches`);
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка при получении веток репозитория:', error.message);
    const errorInfo = handleGitHubError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// Создание новой ветки в репозитории
router.post('/repos/:username/:repo/branches', async (req, res) => {
  try {
    const { username, repo } = req.params;
    const { name, sha } = req.body;
    const githubClient = createGitHubClient(process.env.GITHUB_TOKEN);
    
    // Сначала получаем SHA последнего коммита в master ветке, если не указан
    let refSha = sha;
    if (!refSha) {
      const masterRef = await githubClient.get(`/repos/${username}/${repo}/git/refs/heads/master`);
      refSha = masterRef.data.object.sha;
    }
    
    // Создаем новую ветку
    const response = await githubClient.post(`/repos/${username}/${repo}/git/refs`, {
      ref: `refs/heads/${name}`,
      sha: refSha
    });
    
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Ошибка при создании ветки:', error.message);
    const errorInfo = handleGitHubError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// Получение коммитов репозитория
router.get('/repos/:username/:repo/commits', async (req, res) => {
  try {
    const { username, repo } = req.params;
    const { sha, path, author, since, until, per_page, page } = req.query;
    const githubClient = createGitHubClient(process.env.GITHUB_TOKEN);
    
    const params = {};
    if (sha) params.sha = sha;
    if (path) params.path = path;
    if (author) params.author = author;
    if (since) params.since = since;
    if (until) params.until = until;
    if (per_page) params.per_page = per_page;
    if (page) params.page = page;
    
    const response = await githubClient.get(`/repos/${username}/${repo}/commits`, { params });
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка при получении коммитов:', error.message);
    const errorInfo = handleGitHubError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

// Создание коммита
router.post('/repos/:username/:repo/commits', async (req, res) => {
  try {
    const { username, repo } = req.params;
    const { message, branch, changes } = req.body;
    const githubClient = createGitHubClient(process.env.GITHUB_TOKEN);
    
    // Получаем последний коммит в ветке
    const branchData = await githubClient.get(`/repos/${username}/${repo}/branches/${branch || 'master'}`);
    const lastCommitSha = branchData.data.commit.sha;
    
    // Получаем дерево коммита
    const treeResponse = await githubClient.get(`/repos/${username}/${repo}/git/trees/${lastCommitSha}`);
    const baseTree = treeResponse.data.sha;
    
    // Создаем новые блобы для каждого измененного файла
    const blobs = await Promise.all(
      Object.entries(changes).map(async ([path, content]) => {
        const blobResponse = await githubClient.post(`/repos/${username}/${repo}/git/blobs`, {
          content: encodeContent(content),
          encoding: 'base64'
        });
        
        return {
          path,
          mode: '100644',
          type: 'blob',
          sha: blobResponse.data.sha
        };
      })
    );
    
    // Создаем новое дерево
    const newTreeResponse = await githubClient.post(`/repos/${username}/${repo}/git/trees`, {
      base_tree: baseTree,
      tree: blobs
    });
    
    // Создаем новый коммит
    const newCommitResponse = await githubClient.post(`/repos/${username}/${repo}/git/commits`, {
      message,
      tree: newTreeResponse.data.sha,
      parents: [lastCommitSha]
    });
    
    // Обновляем ссылку на ветку
    await githubClient.patch(`/repos/${username}/${repo}/git/refs/heads/${branch || 'master'}`, {
      sha: newCommitResponse.data.sha
    });
    
    res.status(201).json(newCommitResponse.data);
  } catch (error) {
    console.error('Ошибка при создании коммита:', error.message);
    const errorInfo = handleGitHubError(error);
    res.status(errorInfo.status).json({ error: errorInfo.message });
  }
});

module.exports = router; 