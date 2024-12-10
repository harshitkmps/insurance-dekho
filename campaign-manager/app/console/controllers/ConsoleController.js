var registrationModel       = require('../../campaign/models/common/CampaignModel');
var commonModel             = require('../../common/models/CommonModel');
var commonHelper            = require(HELPER_PATH+'CommonHelper.js');
var redisHelper             = require(HELPER_PATH+'RedisHelper');

class ConsoleController{
    constructor() {
    }
}

ConsoleController.getAllMMV = async function(req, res){ 
    try{
        let [carMakes, carModels, carVariants] = await Promise.all([commonModel.getCarMake(), commonModel.getCarModel(), commonModel.getCarVariant()]);
        
        carMakes.forEach(function (carMake, index) {
            let models = new Array();
            carModels.forEach(function (carModel, index) { 
                let variants = new Array();
                if(carMake.make_id == carModel.make_id){
                    carVariants.forEach(function (carVariant, index) {  
                        if(carModel.model_id == carVariant.model_id){
                            variants.push(carVariant);
                        }                        
                    });                 
                    if(variants.length){
                        redisHelper.setJSON('car_variants_'+carModel.model_id, variants); 
                    }
                    carModel.model_values = [];
                    let carModelStr = carModel.model.replace('-', ' ').replace(/\s\s+/g, ' ').trim();
                    let carModelArr = carModelStr.split(' ');
                    if(carModelArr.length > 1){
                        carModel.model_values = [carModelStr, carModelArr.join(''), carModelArr.join('-')];
                    }
                    models.push(carModel);
                }                       
            });   
            if(models.length){
                redisHelper.setJSON('car_models_'+carMake.make_id, models); 
            }
            carMake.make_values = [];
            let carMakeStr = carMake.make.replace('-', ' ').replace(/\s\s+/g, ' ').trim();
            let carMakeArr = carMakeStr.split(' ');
            if(carMakeArr.length > 1){
                carMake.make_values = [carMakeStr, carMakeArr.join(''), carMakeArr.join('-')];
            }
        });      
        redisHelper.setJSON('car_makes', carMakes); 
        
        let [bikeMakes, bikeModels, bikeVariants] = await Promise.all([commonModel.getBikeMake(), commonModel.getBikeModel(), commonModel.getBikeVariant()]);
        
        bikeMakes.forEach(function (bikeMake, index) {
            let models = new Array();
            bikeModels.forEach(function (bikeModel, index) { 
                let variants = new Array();
                if(bikeMake.make_id == bikeModel.make_id){
                    bikeVariants.forEach(function (bikeVariant, index) {  
                        if(bikeModel.model_id == bikeVariant.model_id){
                            variants.push(bikeVariant);
                        }                        
                    });
                    if(variants.length){
                        redisHelper.setJSON('bike_variants_'+bikeModel.model_id, variants); 
                    }
                    bikeModel.model_values = [];
                    let bikeModelStr = commonHelper.removeMakeNameFromModelName(bikeModel.make, bikeModel.model);
                    bikeModelStr     = bikeModelStr.replace('-', ' ').replace(/\s\s+/g, ' ').trim();
                    let bikeModelArr = bikeModelStr.split(' ');
                    if(bikeModelArr.length > 1){
                        bikeModel.model_values = [bikeModelStr, bikeModelArr.join(''), bikeModelArr.join('-')];
                    }
                    models.push(bikeModel);
                }                       
            });   
            if(models.length){
                redisHelper.setJSON('bike_models_'+bikeMake.make_id, models); 
            }
            bikeMake.make_values = [];
            let bikeMakeStr = bikeMake.make.replace('-', ' ').replace(/\s\s+/g, ' ').trim();
            let bikeMakeArr = bikeMakeStr.split(' ');
            if(bikeMakeArr.length > 1){
                bikeMake.make_values = [bikeMakeStr, bikeMakeArr.join(''), bikeMakeArr.join('-')];
            }
        });     
        redisHelper.setJSON('bike_makes', bikeMakes); 
        console.log('All MMV Done');
        
        res.send('Done');
    }catch(err){
        console.log(err);
        res.send('Error');
    }
}

ConsoleController.getAllRTO = async function (req, res) {
    try {
        let rtoDetails = await commonModel.getRtoDetail();
        rtoDetails.forEach(rtoDetail => {
            let key    = `rto_${rtoDetail.rtoCode}`;
            let result = [rtoDetail];
            redisHelper.setJSON(key, result);
        });
        
        console.log('Rto Done');
        res.send("Done");
    } catch (err) {
        console.log(err);
        res.send("Error");
    }
};

ConsoleController.autoMapRegistrationText = async function(req, res){ 
    try{
        let limit = req.query && req.query.limit?parseInt(req.query.limit):config.autoMapRegistrationText.limit;
        let count = await registrationTextModel.autoMapRegistrationText(limit);
        console.log('Auto Mapped Registration Text : '+count);
        res.send('Auto Mapped Registration Text : '+count);
    }catch(err){
        console.log(err);
        res.send("Error");
    }
}

ConsoleController.autoMapVariant = async function(req, res){
    let errors = new Array();
    try{
        if(!errors.length){ 
            
            let sortFields = {created_at:1};         
            if(req.query.sort){
               sortFields = {created_at:-1};
            }
            let registrations = await registrationPrimeModel.find({central_make_id:22, vehicle_category: "Four Wheeler", status:2}).sort(sortFields).limit(10000).execAsync();   

            for(let registration of registrations) {
                
                if(registration.registration_number){
                    try{
                        let variantText = commonHelper.getVariantText(registration.maker_model, registration.central_make_name, registration.central_model_name);
                        if(!variantText){
                            let makeModel = registration.maker_model.split('/');
                            if(makeModel.length > 1){
                                variantText = makeModel[1];
                            }
                        }
                        let autoMappedVariant = await registrationTextModel.getAutoMappedVariant(registration.vehicle_category, variantText, registration.central_model_id, registration.fuel_type);
                        console.log(registration.registration_number, registration.maker_model);
                        console.log(autoMappedVariant);
                        if(!commonHelper.isEmpty(autoMappedVariant)){
                            await registrationPrimeModel.updateOneAsync({_id:registration._id}, {status:10, central_version_id:autoMappedVariant.variant_id, central_version_name:autoMappedVariant.variant_name});
                        }else{
                            await registrationPrimeModel.updateOneAsync({_id:registration._id}, {status:20});
                        }
                    }catch(e){
                        console.log(e)
                        if(typeof e !== 'string'){
                            e = 'Error'
                        }
                        await registrationPrimeModel.updateOneAsync({_id:registration._id}, {status:30});
                    }   
                }
            }  
            console.log('Total Registration Numbers : '+registrations.length)
            res.send('Done');
        }else{
            throw errors;
        }  
    }catch(e){
        console.log(e)
        res.send('Error');
    }   
}

ConsoleController.getRegistrationFromRegistrationRequest = async function(req, res){
    try{
        let pendingRegistration = await requestRegistrationModel.findAsync({status:0},{registration_number:1});
        if(pendingRegistration.length){
            pendingRegistration.forEach(async function(element, index){
                registrationModel.processRegistration(element.registration_number)
                    .then(function(registration){
                        if(registration){
                            requestRegistrationModel.findOneAndUpdateAsync({_id:element._id},{status:1}).catch(function(e){
                                console.log(e);
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    })
            });
        }
        console.log('Done');
        res.send('Done');
    }catch(err){
        console.log(err);
        res.send("Error");
    }
}

module.exports = ConsoleController;
