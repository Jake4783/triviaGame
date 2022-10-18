const router = require('express').Router();
const { Project, User, Quiz } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) => {
  try {
    // Get all projects and JOIN with user data
    const projectData = await Project.findAll({
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });

    // Serialize data so the template can read it
    const projects = projectData.map((project) => project.get({ plain: true }));

    // Pass serialized data and session flag into template
    res.render('homepage', {
      projects,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    res.status(500).json(err);
  }
});
// router.get('/', async (req, res) => {
//   try {
//     // Get all projects and JOIN with user data
//     const quizData = await Quiz.findAll();

//     // Serialize data so the template can read it
//     const quiz = quizData.map((q) => q.get({ plain: true }));

//     // Pass serialized data and session flag into template
//     res.render('homepage', { 
//       quiz, 
//       logged_in: req.session.logged_in 
//     });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

router.get('/project/:id', async (req, res) => {
  try {
    const projectData = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });

    const project = projectData.get({ plain: true });

    res.render('project', {
      ...project,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
// router.get('/profile', withAuth, async (req, res) => {
//   try {
//     // Find the logged in user based on the session ID
//     const userData = await User.findByPk(req.session.user_id, {
//       attributes: { exclude: ['password'] },
//       include: [{ model: Project }],
//     });

//     const user = userData.get({ plain: true });

//     res.render('profile', {
//       ...user,
//       logged_in: true
//     });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });
router.get('/quiz/:id/:category', withAuth, async (req, res) => {
  try {
    // Get all projects and JOIN with user data
    const quizData = await Quiz.findAll({
      where: {
        category: req.params.category
      },
    });

    // Serialize data so the template can read it
    const quiz = quizData.map((q) => q.get({ plain: true }));

    // Pass serialized data and session flag into template
    res.render('homepage', {
      quiz,
      user_id: req.params.id,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/categories');
    return;
  }

  res.render('login');
});

router.get('/categories', async (req, res) => {

  const categoryData = await Quiz.findAll({ attributes: ['category'] });
  let category = categoryData.map((q) => q.get({ plain: true }));
  console.log(category)

  category = category.map((q) => q.category)
  console.log(category)
  category = [...new Set(category)]
  console.log(category)
  let categories = []
  for (let index = 0; index < category.length; index++) {
    categories.push({ "category": category[index], "user_id": req.session.user_id})
  }
  console.log(categories)

  res.render('categorypage', { categories });
})

router.get('/score/:id', async (req, res) => {
  console.log("hello")
  console.log(req.params.id)
  try {
    // Get all projects and JOIN with user data
    const scoreData = await User.findOne({ where: { id: parseInt(req.params.id) } });
    console.log(scoreData)
    const leaderBoardData = await User.findAll({ order: [["score", "DESC"]] });
    const leaderBoard = leaderBoardData.map((user) => user.get({ plain: true }));
    // Serialize data so the template can read it
    const score = scoreData.get({ plain: true });
    console.log(score)
    // Pass serialized data and session flag into template
    res.render('scorepage', {
      ...score, leaderBoard,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
