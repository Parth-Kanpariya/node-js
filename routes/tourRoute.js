const express = require('express')
const router = express.Router()
const tourController = require('../controller/tourController')

router
    .route('/tour/top-5-cheap')
    .get(tourController.aliasTopTour, tourController.getAllTour)

router
    .route('/tour')
    .post(tourController.createTour)
    .get(tourController.getAllTour)

router.route('/tour/tour-stats').get(tourController.getTourStats)
router.route('/tour/monthly-plan/:year').get(tourController.getMonthlyPlan)

// router.get('/tour/:id', tourController.getTour)
// router.patch('/tour/:id', tourController.updateTour)
// router.delete('/tour/:id', tourController.deleteTour)

router
    .route('/tour/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)

module.exports = router