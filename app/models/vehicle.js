var moment = require('moment');
var Ids = require("../../util/Ids");

module.exports = function (orm, db) {
    var Vehicle = db.define('vehicle', {
            id: {type: 'text', required: true},
            sProvinceCode: {type: 'text', required: true},
            sProvince: {type: 'text', required: true},
            sCityCode: {type: 'text', required: true},
            sCity: {type: 'text', required: true},
            sAreaCode: {type: 'text'},
            sArea: {type: 'text'},
            eProvinceCode: {type: 'text'},
            eProvince: {type: 'text'},
            eCityCode: {type: 'text'},
            eCity: {type: 'text'},
            eAreaCode: {type: 'text'},
            eArea: {type: 'text'},
            image: {type: 'text'},
            vehicleNumber: {type: 'text'},
            loadWeight: {type: 'text'},
            unit: {type: 'number'},
            vehicleLength: {type: 'number'},
            vehicleTypeCode: {type: 'text', required: true},
            vehicleType: {type: 'text', required: true},
            referPrice: {type: 'number'},
            referPriceFlag: {type: 'number'},
            loadingTime: {type: 'text'},
            contact: {type: 'text'},
            tel: {type: 'text'},
            phone: {type: 'text'},
            valid: {type: 'text'},
            expiryDate: {type: 'text'},
            isDeleted: {type: 'number'},
            status: {type: 'number'},
            freeText: {type: 'text'},
            infoText: {type: 'text'},
            description: {type: 'text'},
            eId: {type: 'text'},//关联企业的uuid
            createrId: {type: 'text', required: true},//关联用户的uuid
            createdAt: { type: 'text', required: true },
            updaterId: {type: 'text'},//关联用户的uuid
            updatedAt: { type: 'text' }
        },
        {
            hooks: {
                beforeValidation: function () {
//                    this.createdAt = new Date();
                }
            },
            validations: {

            },
            methods: {
                serialize: function () {
                    return {
                        id: Ids.GenerateId('20'),
                        sProvinceCode: this.sProvinceCode,
                        sProvince: this.sProvince,
                        sCityCode: this.sCityCode,
                        sCity: this.sCity,
                        sAreaCode: this.sAreaCode,
                        sArea: this.sArea,
                        eProvinceCode: this.eProvinceCode,
                        eProvince: this.eProvince,
                        eCityCode: this.eCityCode,
                        eCity: this.eCity,
                        eAreaCode: this.eAreaCode,
                        eArea: this.eArea,
                        image: this.image,
                        vehicleNumber: this.vehicleNumber,
                        loadWeight: this.loadWeight,
                        unit: 1, //0: 方 1:吨
                        vehicleLength: this.vehicleLength,
                        vehicleTypeCode: this.vehicleTypeCode,
                        vehicleType: this.vehicleType,
                        loadingTime: this.loadingTime,
                        referPrice: 0, //0:电询
                        referPriceFlag: 1, //0:元/方  1:元/吨
                        contact: this.contact,
                        tel: this.tel,
                        phone: this.phone,
                        valid: this.valid,
                        expiryDate: moment().format('YYYY-MM-DD HH:mm:ss'),
                        isDeleted: 0,//0:不删除，1:删除
                        status: 1,//0:不发布，1:发布
                        freeText: this.freeText,
                        eId: this.eId,
                        createrId: this.createrId,
                        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                        updaterId: this.updaterId,
                        updatedAt: this.updatedAt
                    };
                }
            }
        });
};