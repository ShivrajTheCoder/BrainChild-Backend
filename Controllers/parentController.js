const { RouterAsyncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const ParentModel = require("../Models/ParentModel");
const RequestModel = require("../Models/RequestModel");
const EnrollmentReq = require("../Models/EnrollmentRequest");
const User = require("../Models/User");
const { NotFoundError, CustomError } = require("../Utilities/CustomErrors");
const exp = module.exports;
const Razorpay = require('razorpay');
const Order = require("../Models/OrderModel");
const { validationResult } = require("express-validator");
const CourseModel = require("../Models/CourseModel");
const SuggestionModel = require("../Models/SuggestionModel");
const razorpayInstance = new Razorpay({
    key_id: process.env.RZ_KEY,
    key_secret: process.env.RZ_SECRET,
});
exp.sendParentRequest = RouterAsyncErrorHandler(async (req, res, next) => {
    const { parentEmail, childEmail } = req.body;
    console.log(req.body);
    try {
        const child = await User.findOne({ email: childEmail });
        const parent = await ParentModel.findOne({ email: parentEmail });
        if (!child || !parent) {
            throw new NotFoundError("No such user or parent found!");
        }
        const newReq = new RequestModel({
            sender: parentEmail, receiver: childEmail
        })
        const saved = await newReq.save();
        return res.status(201).json({
            message: "Request sent!",
            request: saved
        })
    }
    catch (error) {
        next(error);
    }
})

exp.getAllChildCourses = RouterAsyncErrorHandler(async (req, res, next) => {
    const { parentId } = req.params;
    try {
        const parent = await ParentModel.findById(parentId);
        if (!parent) {
            throw new NotFoundError("Parent not found!");
        }
        const childId = parent.child;
        if (!childId) {
            throw new NotFoundError("No child of parent");
        }
        const child = await User.findById(childId).populate("courses")
        if (!child) {
            throw new NotFoundError("Child Not found!");
        }
        const { courses } = child;
        if (!courses || courses.length === 0) {
            throw new NotFoundError("No courses found for the child!");
        }
        return res.status(200).json({
            message: "Courses Found!",
            courses
        });
    } catch (error) {
        next(error); // Pass the caught error to the error handling middleware
    }
});

exp.getCourseRequests = RouterAsyncErrorHandler(async (req, res, next) => {
    const { childId } = req.params;
    // console.log(childId);
    try {
        const requests = await EnrollmentReq.find({ userId: childId }).populate('courseId');
        if (requests.length < 1) {
            throw new NotFoundError("No Course request");
        }
        // console.log(requests);
        return res.status(200).json({
            message: "Requests found!",
            requests
        })
    }
    catch (error) {
        next(error);
    }
})
exp.addVideoFeedback = RouterAsyncErrorHandler(async (req, res, next) => {
    try {

    }
    catch (error) {
        next();
    }
})

exp.addSuggestion = RouterAsyncErrorHandler(async (req, res, next) => {
    try {

    }
    catch (error) {
        next();
    }
})

exp.orderCourse = RouterAsyncErrorHandler(async (req, res, next) => {
    const { course, user, amount = 500 } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Create a new order in Razorpay
        const options = {
            amount: amount * 100, // Amount in paise
            currency: "INR",
            receipt: `receipt_order_${Math.random() * 10000}`, // Generate a random receipt ID
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        // Create a new order in our database
        const newOrder = new Order({
            course: course,
            amount: amount,
            user,
            rzId: razorpayOrder.id,
        });

        const savedOrder = await newOrder.save();

        return res.status(201).json({
            message: "Order created successfully",
            order: savedOrder,
            razorpayOrderId: razorpayOrder.id,
        });
    } catch (error) {
        next(error);
    }
})
exp.paymentSuccess = RouterAsyncErrorHandler(async (req, res, next) => {
    const { razorpayOrderId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        if (!razorpayOrderId) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const order = await Order.findOne({ rzId: razorpayOrderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.paymentStatus = true;
        await order.save();

        const user = await User.findById(order.user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user.courses);
        if (!user.courses.includes(order.course)) {
            user.courses.push(order.course);
            await user.save();

            // Log the user document after saving
            console.log('User document after adding course:', user);
        }

        const course = await CourseModel.findById(order.course);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        course.enrolled += 1;
        await course.save();

        await EnrollmentReq.findOneAndDelete({ courseId: order.course, userId: order.user });

        return res.status(200).json({
            message: 'Payment successful!',
            order: order,
        });
    } catch (error) {
        next(error);
    }
});

exp.childWatchedVideo = RouterAsyncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { childId } = req.params;

    try {
        const child = await User.findById(childId).populate({
            path: 'watchedVideos',
            populate: [
                { path: 'course', select: 'name' },
                { path: 'author',select:"email" },
            ]
        });

        if (!child) {
            throw new NotFoundError("Child not found!");
        }

        return res.status(200).json({
            message: "Here are the videos watched",
            videos: child.watchedVideos,
        });
    } catch (error) {
        next(error);
    }
});

exp.addSuggestion = RouterAsyncErrorHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { description, author } = req.body;

    try {
        const suggestion = await SuggestionModel.create({ description, author });
        if (!suggestion) {
            throw new Error("Failed to create suggestion");
        }
        return res.status(201).json({
            message: "Suggestion created successfully",
            data: suggestion
        });
    } catch (error) {
        next(error);
    }
});