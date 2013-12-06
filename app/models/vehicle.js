var moment = require('moment');

module.exports = function (orm, db) {
    var Vehicle = db.define('vehicle', {
            sProvinceCode: {type: 'text', required: true},
            sProvince: {type: 'text', required: true},
            sCityCode: {type: 'text', required: true},
            sCity: {type: 'text', required: true},
            sAreaCode: {type: 'text'},
            sArea: {type: 'text'},
            eProvinceCode: {type: 'text', required: true},
            eProvince: {type: 'text', required: true},
            eCityCode: {type: 'text', required: true},
            eCity: {type: 'text', required: true},
            eAreaCode: {type: 'text'},
            eArea: {type: 'text'},
            image: {type: 'text'},
            vehicleNumber: {type: 'text'},
            loadWeight: {type: 'text'},
            vehicleLength: {type: 'number'},
            vehicleTypeCode: {type: 'text', required: true},
            vehicleType: {type: 'text', required: true},
            goodsTypeCode: {type: 'text', required: true},
            goodsType: {type: 'text', required: true},
            referPrice: {type: 'number'},
            referPriceFlag: {type: 'number'},
            loadingTime: {type: 'text'},
            contact: {type: 'text'},
            tel: {type: 'text'},
            phone: {type: 'text'},
            valid: {type: 'text'},
            expiryDate: {type: 'date'},
            isDeleted: {type: 'number'},
            status: {type: 'number'},
            freeText: {type: 'text'},
            eId: {type: 'text'},//关联企业的uuid
            createrId: {type: 'text', required: true},//关联用户的uuid
            createdAt: { type: 'date', required: true, time: true },
            updaterId: {type: 'text'},//关联用户的uuid
            updatedAt: { type: 'date', time: true }
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
                        vehicleLength: this.vehicleLength,
                        vehicleTypeCode: this.vehicleTypeCode,
                        vehicleType: this.vehicleType,
                        goodsTypeCode: this.goodsTypeCode,
                        goodsType: this.goodsType,
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