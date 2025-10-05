const Task = require('../models/Task');

// List tasks with simple pagination (page query param)
exports.listTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;
    const total = await Task.countDocuments({ user: userId });
    const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    res.render('index', {
      user: req.user,
      tasks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      messages: req.flash()
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Cannot fetch tasks');
    res.redirect('/');
  }
};

exports.getAddTask = (req, res) => {
  res.render('addTask', { user: req.user, messages: req.flash() });
};

exports.postAddTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    await Task.create({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || 'medium',
      user: req.user._id
    });
    req.flash('success_msg', 'Task added');
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to add task');
    res.redirect('/tasks');
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!task) {
      req.flash('error_msg', 'Task not found');
      return res.redirect('/tasks');
    }
    res.render('taskDetails', { user: req.user, task, messages: req.flash() });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching task');
    res.redirect('/tasks');
  }
};

exports.getEditTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!task) {
      req.flash('error_msg', 'Task not found');
      return res.redirect('/tasks');
    }
    res.render('editTask', { user: req.user, task, messages: req.flash() });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error fetching task');
    res.redirect('/tasks');
  }
};

exports.putEditTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, dueDate: dueDate ? new Date(dueDate) : undefined, priority },
      { new: true }
    );
    req.flash('success_msg', 'Task updated');
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating task');
    res.redirect('/tasks');
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    // If AJAX request:
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({ success: true });
    }
    req.flash('success_msg', 'Task deleted');
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error deleting task');
    res.redirect('/tasks');
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Task.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { status });
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({ success: true });
    }
    req.flash('success_msg', 'Status updated');
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error updating status');
    res.redirect('/tasks');
  }
};
