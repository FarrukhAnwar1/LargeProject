import Car from '../../models/car.js';
import User from '../../models/user.js';

export const addCar = async (req, res) => {
    console.log("req.body", req.body);
    

    try{

        //Grab information from car:
        const {licensePlate, rentalStatus, currentRental, year, color, make, model, mileage, repairStatus, warningLightIndicators, vehicleIdentificationNumber, carType} = req.body;

        if(!licensePlate ||!year|| !color
            || !make || !model 
            || !vehicleIdentificationNumber 
        ) {
            return res.status(400).json({message: "All fields are required"});
        }
        //First get the proper user:
        const userId = req.user.userId;

        //find the company name of the user 
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message:'User not found'});

        //add the car data
        const car = new Car({
            userID: user._id,
            licensePlate,
            year,
            color,
            make,
            model,
            mileage: mileage || 0,
            vehicleIdentificationNumber,
            carType: carType || 'sedan',
            rentalStatus: rentalStatus || 'available',
            warningLightIndicators: warningLightIndicators || []
        });

        await car.save();

        res.status(201).json ({ success: true, mesage: 'Car added successfully', car});

    }catch(error){
        console.error(error);
        res.status(400).json ({success: false, message: error.message});
    }

};




export const deleteCar = async(req, res) => {
    try{
        const carId = req.params.id;
        const userId = req.user.userId;

        if(!carId){
            return res.status(400).json({success: false, messag: "Car ID is required"});
        }

        //get the current user 
        const user = await User.findById(userId);
        if(!user)return res.status(404).json ({sucess: false, message: "User was not found"});

        //then find the car we want
        const car = await Car.findById(carId);
        if(!car){
            return res.status(404).json({success: false, message:"Car was not found"});
        }


        //find the company and compare, just in case, i commented out cause we should never be able to see cars we cant access
        // const carOwner = await User.findById(car.userID);
        // if(user.companyName !== carOwner.companyName){
        //     return res.status(403).json({success: false, message: "You don't have permission to delete this car"});
        // }

        await Car.findByIdAndDelete(carId);
        res.status(200).json ({success: true, message: "Car successfully deleted"});
    }catch (error){
        console.error("Error deleting car:", error);
        res.status(400).json({success: false, message: error.message});
    }
};

export const editCar = async (req, res) => {
    try{
        const carId = req.params.id;
        const userId = req.user.userId;

        //first check company
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({success: false, message: "User not found"});

        //find car using id
        const car = await Car.findById(carId);
        if(!car) return res.status(404).json({success:false, message: "Car not found"});
         
        //extra protection to make sure outside of users of company can edit car
        const carOwner = await User.findById(car.userID);
        if(carOwner.companyName !== user.companyName) return res.status(403).json({success: false, message: "Access Denied "});
    

    const fieldsUpdate = [
        "licensePlate",
        "rentalStatus",
        "year",
        "color",
        "make",
        "model",
        "mileage",
        "repairStatus",
        "warningLightIndicators",
        "vehicleIdentificationNumber",
        "carType"
        ];

        fieldsUpdate.forEach(field => {
            if(req.body[field] !== undefined){
                car[field] = req.body[field];
            }
        });

        await car.save();
        res.status(200).json({success: true, message: "Car updated successsfully", car});

    }catch (error){
        console.error(error);
        res.status(400).json({success: false, message: error.message});
    }
};



export const getCars = async(req, res)=> {
    try {
        const userId = req.user.userId;

        //Find Current User
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({success: false, message: "User not found"});

        let query = {userID: user._id};

        //If we want to add filtering in our searches:
        if(req.query.rentalStatus) query.rentalStatus = req.query.rentalStatus;
        if(req.query.carType) query.carType = req.query.carType;
        if(req.query.make) query.make = req.query.make;
        if(req.query.model) query.model = req.query.model;
        if(req.query.year) query.year = Number(req.query.year);

        const cars = await Car.find(query);

        res.status(200).json({success: true, cars});

    }catch(error){
        console.error("Error fetching cars:", error);
        res.status(400).json({success: false, message: error.message});
    }
};