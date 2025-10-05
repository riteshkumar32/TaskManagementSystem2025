const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { ensureAuth } = require('../middleware/ensureAuth');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

// all routes protected
router.get('/', ensureAuth, taskController.listTasks);
router.get('/new', ensureAuth, taskController.getAddTask);
router.post('/', ensureAuth, taskController.postAddTask);
router.get('/:id', ensureAuth, taskController.getTask);
router.get('/:id/edit', ensureAuth, taskController.getEditTask);
router.put('/:id', ensureAuth, taskController.putEditTask);
router.delete('/:id', ensureAuth, taskController.deleteTask);
router.patch('/:id/status', ensureAuth, taskController.updateStatus);

module.exports = router;
