var moment = require('moment');

module.exports = function (orm, db) {
    var Store = db.define('store', {
            provinceCode: {type: 'text', required: true},
            province: {type: 'text', required: true},
            cityCode: {type: 'text', required: true},
            city: {type: 'text', required: true},
            areaCode: {type: 'text'},
            area: {type: 'text'},
            storeName: {type: 'text'},
            image: {type: 'text'},
            storeTypeCode: {type: 'text', required: true},
            storeType: {type: 'text', required: true},
            busneissScopeCode: {type: 'text', required: true},
            busneissScope: {type: 'text', required: true},
            storeArea: {type: 'number'},
            useArea: {type: 'number'},
            referPrice: {type: 'number'},
            referPriceFlag: {type: 'number'},
            contact: {type: 'text'},
            address: {type: 'text'},
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
                        provinceCode: this.provinceCode,
                        province: this.province,
                        cityCode: this.cityCode,
                        city: this.city,
                        areaCode: this.areaCode,
                        area: this.area,
                        image: this.image,
                        storeName: this.storeName,
                        storeTypeCode: this.storeTypeCode,
                        storeType: this.storeType,
                        busneissScopeCode: this.busneissScopeCode,
                        busneissScope: this.busneissScope,
                        storeArea: this.storeArea,
                        useArea: this.useArea,
                        referPrice: 0, //0:电询
                        referPriceFlag: 0, //0:平方/元
                        contact: this.contact,
                        address:this.address,
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