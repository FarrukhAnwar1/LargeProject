import Rental from '../../models/rental.js';
import Car from '../../models/car.js';

export const addRental = async(req,res)=> {
    try{
        const{carID, renterName, renterEmail, renterPhone, dateRentedOut, expectedReturnDate, rentalRatePerDay, notes} = req.body;

        if(!carID || !renterName || !renterEmail || !dateRentedOut || !expectedReturnDate || !rentalRatePerDay){
            return res.status(400).json({success: false, message: "All fields must be entered"});
        }

        const car = await Car.findById(carID);
        if(!car) return res.status(404).json({success: false, message: "Car not found"});

        const rental = new Rental({
            carID,
            renterName,
            renterEmail,
            renterPhone: renterPhone || "",
            dateRentedOut,
            expectedReturnDate,
            rentalRatePerDay,
            totalCost: 0,
            notes: notes || "",
        });

        car.rentalStatus = "rented";
        await rental.save();
        res.status(201).json({success: true, message: "Rental created successfully", rental});
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
        console.log(error);
        res.status(400).json({success: false, message:error.message});
    }
};

export const editRental = async (req, res) =>{
    try{
        const{id} = req.params;
        const rental = await Rental.findById(id);
        if(!rental) return res.status(404).json({success: false, message: "Rental not found"});

        //updates if fields exist in request
        const fields = ["renterName", "renterEmail","renterPhone", "dateRentedOut", "expectedReturnDate", "actualReturnDate", 
            "overdueStatus", "rentalRatePerDay", "totalCost", "notes"
        ];
        fields.forEach(field => {
            if(req.body[field] !== undefined) rental[field] = req.body[field];
        });

        await rental.save();
        res.status(200).json({success: true, message: "Rental updated successfully"});
    }catch(error){
        console.log(error);
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
        if(!carID) return res.status(400).json({success: false, message: "Car ID required"});
        let query = {carID};

        //this is to get the active rental only
        if(req.query.current === 'true'){
            query.actualReturnDate = {$exists: false};
        }

        const rentals = await Rental.find(query).sort({dateRentedOut: -1});
        res.status(200).json({success: true, rentals});
    }catch(error){
        console.error(error);
        res.status(400).json({success: false, message: error.message});
    }
}

