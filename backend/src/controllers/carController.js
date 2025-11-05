import Car from '../../models/car.js';
import User from '../../models/user.js';

export const addCar = async (req, res) => {
    console.log("req.body", req.body);
    
    try{
        const userId = req.user.userId;

        //find the company name of the user 
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message:'User not found'});
        
        //Grab information from car:
        const {licensePlate, rentalStatus, currentRental, year, color, make, model, mileage, repairStatus, warningLightIndicators, vehicleIdentificationNumber, carType} = req.body;

        if(!licensePlate ||!year|| !color
            || !make || !model 
            || !vehicleIdentificationNumber 
        ) {
            return res.status(400).json({message: "All fields are required"});
        }

        //add the car data
        const car = new Car({
            userID: user._id,
            companyName: user.companyName !== "N/A" ? user.companyName : "N/A",
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

        res.status(201).json ({ success: true, message: 'Car added successfully', car});

    }catch(error){
        console.error(error);
        res.status(400).json ({success: false, message: error.message});
    }

};




export const deleteCar = async(req, res) => {
    try{
        const userId = req.user.userId;
        const carId = req.params.id;

        if(!carId){
            return res.status(400).json({success: false, message: "Car ID is required"});
        }

        //get the current user 
        const user = await User.findById(userId);
        if(!user)return res.status(404).json ({success: false, message: "User was not found"});

        //then find the car we want
        const car = await Car.findById(carId);
        if(!car){
            return res.status(404).json({success: false, message:"Car was not found"});
        }


        //Sees if the user has a company and a user, and isn't N/A
        if(user.companyName !== "N/A"){
            if(car.companyName !== user.companyName){
                            return res.status(403).json({success: false, message: "Access Denied to Delete. Company cars only."});
            }
        }else if (String (car.userID) !== String(user._id)){ //if a car has no company name, it checks based on ID
            return res.status(403).json({success: false, message: "Access Denied to Delete. Personal cars only."});
        }

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
         
        //extra protection to make sure outside of users of company can't edit car
        if(user.companyName !== "N/A"){
            if(car.companyName !== user.companyName){
                            return res.status(403).json({success: false, message: "Access Denied to Edit. Company cars only."});
            }
        }else if (String (car.userID) !== String(user._id)){ //if a car has no company name, it checks based on ID
            return res.status(403).json({success: false, message: "Access Denied to Edit. Personal cars only."});
        }

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
        res.status(200).json({success: true, message: "Car updated successfully", car});

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


        let query = {};

        //if company name "N/A" return cars of user only
        //else return all the cars of that company
        if(user.companyName === "N/A"){
            query.userID = user._id;
        }else{
            query.companyName = user.companyName;
        }

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