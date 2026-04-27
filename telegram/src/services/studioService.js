const fs = require('fs');
const path = require('path');

const PROJECTS_PATH = path.resolve(
  __dirname,
  '../../',
  process.env.PROJECTS_PATH || '../projects'
);

// Estado en memoria: proyecto activo por usuario
const activeProjects = new Map();

function getProjectsPath() {
  return PROJECTS_PATH;
}

function listProjects() {
  if (!fs.existsSync(PROJECTS_PATH)) return [];
  return fs.readdirSync(PROJECTS_PATH, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

function setActiveProject(userId, projectName) {
  const projects = listProjects();
  if (!projects.includes(projectName)) return false;
  activeProjects.set(userId, projectName);
  return true;
}

function getActiveProject(userId) {
  return activeProjects.get(userId) || null;
}

function readProjectFile(projectName, filename) {
  const filePath = path.join(PROJECTS_PATH, projectName, filename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

function getProjectStatus(projectName) {
  const tasks = readProjectFile(projectName, 'tasks.md');
  const requirements = readProjectFile(projectName, 'requirements.md');
  return { tasks, requirements };
}

module.exports = {
  listProjects,
  setActiveProject,
  getActiveProject,
  readProjectFile,
  getProjectStatus,
  getProjectsPath,
};
