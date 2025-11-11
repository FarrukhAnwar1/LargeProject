import Rental from '../../models/rental.js';
import Car from '../../models/car.js';

export const addRental = async(req,res)=> {
    try{
        const{
            carID, 
            renterName, 
            renterEmail, 
            renterPhone, 
            dateRentedOut, 
            expectedReturnDate, 
            actualReturnDate,
            rentalRatePerDay, 
            notes
        } = req.body;

        // Validate required fields individually for better error messages
        const errors = [];
        if(!carID) errors.push("Car ID is required");
        if(!renterName) errors.push("Renter name is required");
        if(!renterEmail) errors.push("Renter email is required");
        if(!dateRentedOut) errors.push("Rental start date is required");
        if(!expectedReturnDate) errors.push("Expected return date is required");
        if(rentalRatePerDay === null || rentalRatePerDay === undefined) errors.push("Rental rate per day is required");
        if(rentalRatePerDay < 0) errors.push("Rental rate per day cannot be negative");

        if(errors.length > 0) {
            console.log('Rental validation errors:', errors); // Debug log
            return res.status(400).json({
                success: false, 
                message: "Validation failed", 
                errors: errors
            });
        }

        console.log('Attempting to find car with ID:', carID); // Debug log
        const car = await Car.findById(carID);
        if(!car) return res.status(404).json({success: false, message: "Car not found"});

        const rental = new Rental({
            carID,
            renterName,
            renterEmail,
            renterPhone: renterPhone || "",
            dateRentedOut,
            expectedReturnDate,
            actualReturnDate: actualReturnDate || undefined,
            rentalRatePerDay: Number(rentalRatePerDay),
            totalCost: 0,
            notes: notes || "",
        });

        // First save the rental
        const savedRental = await rental.save();
        
        // Then update and save the car
        car.rentalStatus = "rented";
        car.currentRental = savedRental._id; // Link the rental to the car
        await car.save();
        
        // Return both the rental and updated car data
        res.status(201).json({
            success: true,
            message: "Rental created successfully",
            rental: savedRental,
            car: car
        });
    } catch (error){
        console.log(error);
        res.status(400).json({success:false, message: error.message});
    }
};

//Delete

export const deleteRental =  async(req,res) => {
    try {
        const {id} = req.params;
        const rental = await Rental.findById(id);
        if(!rental) return res.status(404).json({success: false, message: "Rental not found"});

        await Rental.findByIdAndDelete(id);
        res.status(200).json({success:true, message: "Rental deleted successfully"});
    }catch(error){
        res.status(400).json({success: false, message:error.message});
    }
};

export const editRental = async (req, res) =>{
    try{
        const{id} = req.params;
        const rental = await Rental.findById(id);
        if(!rental) return res.status(404).json({success: false, message: "Rental not found"});

        // Handle all fields including actualReturnDate
        const fields = ["renterName", "renterEmail", "renterPhone", "dateRentedOut", "expectedReturnDate", 
            "overdueStatus", "rentalRatePerDay", "notes", "actualReturnDate"
        ];
        
        // Handle fields
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field === 'rentalRatePerDay') {
                    rental[field] = Number(req.body[field]);
                } else {
                    rental[field] = req.body[field];
                }
            }
        });

        await rental.save();
        res.status(200).json({success: true, message: "Rental updated successfully"});
    }catch(error){
        console.log(error);
        res.status(400).json({success: false, message: error.message});
    }
};

// Delete all rentals for a specific car
export const deleteRentalsByCar = async (req, res) => {
    try {
        const { carID } = req.params;
        const result = await Rental.deleteMany({ carID });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({success: false, message: "No rentals found for this car"});
        }
        
        res.status(200).json({
            success: true, 
            message: `Deleted ${result.deletedCount} rental(s) for car ${carID}`
        });
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
};

//default lists all rental history 

/*Example:
GET /api/rental/:carID = all history
GET /api/rental/:carID?current=true == current active rental
*/
export const getRentalsByCar = async(req, res)=> {
    try{
        const {carID} = req.params;
        console.log('Getting rentals for car:', carID); // Debug log
        
        if(!carID) return res.status(400).json({success: false, message: "Car ID required"});
        let query = {carID};

        //this is to get the active rental only
        if(req.query.current === 'true'){
            query.actualReturnDate = {$exists: false};
        }

        const rentals = await Rental.find(query).sort({dateRentedOut: -1});
        console.log('Found rentals:', rentals); // Debug log
        
        res.status(200).json({success: true, rentals});
    }catch(error){
        res.status(400).json({success: false, message: error.message});
    }
}

