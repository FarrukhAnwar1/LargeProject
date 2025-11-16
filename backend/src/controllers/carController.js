import Car from '../../models/car.js';
import User from '../../models/user.js';

// Get all companies
export const getCompanies = async (req, res) => {
    try {
        // Find all unique company names where userType is company_admin
        const companies = await User.distinct('companyName', {
            companyName: { $exists: true, $ne: null, $ne: 'N/A' },
            userType: 'company_admin'
        });

        return res.status(200).json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const addCar = async (req, res) => {
    console.log("req.body", req.body);

    try {
        const userId = req.user.userId;

        //find the company name of the user 
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        //Grab information from car:
        const { licensePlate, rentalStatus, currentRental, year, color, make, model, mileage, repairStatus, warningLightIndicators, vehicleIdentificationNumber, carType } = req.body;

        if (!licensePlate || !year || !color
            || !make || !model
            || !vehicleIdentificationNumber
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if a car with the same VIN already exists
        // For company users: check within the same company
        // For non-company users: check only their own cars
        let vinQuery = { vehicleIdentificationNumber: vehicleIdentificationNumber };

        if (user.companyName && user.companyName !== "N/A") {
            // User is in a company - check VIN uniqueness within company
            vinQuery.companyName = user.companyName;
        } else {
            // User is not in a company - check VIN uniqueness only for this user
            vinQuery.userID = user._id;
        }

        const existingCar = await Car.findOne(vinQuery);
        if (existingCar) {
            const message = user.companyName && user.companyName !== "N/A"
                ? "A car with this VIN already exists in your company"
                : "You already have a car with this VIN";
            return res.status(400).json({ message });
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

        res.status(201).json({ success: true, message: 'Car added successfully', car });

    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }

};




export const deleteCar = async (req, res) => {
    try {
        const userId = req.user.userId;
        const carId = req.params.id;

        if (!carId) {
            return res.status(400).json({ success: false, message: "Car ID is required" });
        }

        //get the current user 
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User was not found" });

        //then find the car we want
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ success: false, message: "Car was not found" });
        }


        //Sees if the user has a company and a user, and isn't N/A
        if (user.companyName !== "N/A") {
            if (car.companyName !== user.companyName) {
                return res.status(403).json({ success: false, message: "Access Denied to Delete. Company cars only." });
            }
        } else if (car.userID.toString() !== String(user._id)) { //if a car has no company name, it checks based on ID
            return res.status(403).json({ success: false, message: "Access Denied to Delete. Personal cars only." });
        }

        await Car.findByIdAndDelete(carId);
        res.status(200).json({ success: true, message: "Car successfully deleted" });
    } catch (error) {
        console.error("Error deleting car:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const editCar = async (req, res) => {
    try {
        const carId = req.params.id;
        const userId = req.user.userId;

        //first check company
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        //find car using id
        const car = await Car.findById(carId);
        if (!car) return res.status(404).json({ success: false, message: "Car not found" });

        //extra protection to make sure outside of users of company can't edit car
        if (user.companyName !== "N/A") {
            if (car.companyName !== user.companyName) {
                return res.status(403).json({ success: false, message: "Access Denied to Edit. Company cars only." });
            }
        } else if (String(car.userID) !== String(user._id)) { //if a car has no company name, it checks based on ID
            return res.status(403).json({ success: false, message: "Access Denied to Edit. Personal cars only." });
        }

        // If VIN is being updated, check for duplicates
        if (req.body.vehicleIdentificationNumber && req.body.vehicleIdentificationNumber !== car.vehicleIdentificationNumber) {
            let vinQuery = {
                vehicleIdentificationNumber: req.body.vehicleIdentificationNumber,
                _id: { $ne: carId } // Exclude the current car from the check
            };

            if (user.companyName && user.companyName !== "N/A") {
                // User is in a company - check VIN uniqueness within company
                vinQuery.companyName = user.companyName;
            } else {
                // User is not in a company - check VIN uniqueness only for this user
                vinQuery.userID = user._id;
            }

            const existingCar = await Car.findOne(vinQuery);
            if (existingCar) {
                const message = user.companyName && user.companyName !== "N/A"
                    ? "A car with this VIN already exists in your company"
                    : "You already have a car with this VIN";
                return res.status(400).json({ success: false, message });
            }
        }

        // If license plate is being updated, check for duplicates
        if (req.body.licensePlate && req.body.licensePlate !== car.licensePlate) {
            const existingCar = await Car.findOne({
                licensePlate: req.body.licensePlate,
                _id: { $ne: carId } // Exclude the current car from the check
            });
            if (existingCar) {
                return res.status(400).json({ success: false, message: "A car with this license plate already exists" });
            }
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
            if (req.body[field] !== undefined) {
                car[field] = req.body[field];
            }
        });

        await car.save();
        res.status(200).json({ success: true, message: "Car updated successfully", car });

    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};



export const getCars = async (req, res) => {
    try {
        const userId = req.user.userId;

        //Find Current User
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });


        let query = {};

        //if company name "N/A" return cars of user only
        //else return all the cars of that company
        if (user.companyName === "N/A" || !user.companyName) {
            query.userID = user._id;
        } else {
            query.companyName = user.companyName;
        }

        // Apply filters from query parameters
        const filterFields = ['make', 'model', 'carType', 'rentalStatus'];
        filterFields.forEach(field => {
            if (req.query[field]) {
                query[field] = req.query[field];
            }
        });
        
        // Handle year separately since it needs to be converted to a number
        if (req.query.year) {
            query.year = Number(req.query.year);
        }

        const cars = await Car.find(query);

        res.status(200).json({ success: true, cars });

    } catch (error) {
        console.error("Error fetching cars:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};