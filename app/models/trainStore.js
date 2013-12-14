var moment = require('moment');
var ids = require("../../util/ids");

module.exports = function (orm, db) {
    var TrainStore = db.define('trainStore', {
            id: {type: 'text', required: true},
            provinceCode: {type: 'text', required: true},
            province: {type: 'text', required: true},
            cityCode: {type: 'text', required: true},
            city: {type: 'text', required: true},
            areaCode: {type: 'text'},
            area: {type: 'text'},
            trainStoreName: {type: 'text'},
            image: {type: 'text'},
            trainStoreTypeCode: {type: 'text', required: true},
            trainStoreType: {type: 'text', required: true},
            trainStoreLevelCode: {type: 'text', required: true},
            trainStoreLevel: {type: 'text', required: true},
            trainStoreArea: {type: 'number'},  //面积,标准单位：平方米（m2）
            useableArea: {type: 'number'}, //可用面积,标准单位：平方米（m2）
            goodsTotal: {type: 'number'}, //堆放货物总量,标准单位：吨
            yearThroughput: {type: 'number'}, //年吞吐量,标准单位：吨
            contact: {type: 'text'},
            address: {type: 'text'},
            tel: {type: 'text'},
            phone: {type: 'text'},
            valid: {type: 'text'},
            expiryDate: {type: 'text'},
            isDeleted: {type: 'number'},
            status: {type: 'number'},
            freeText: {type: 'text'},
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
                        id: ids.GenerateId('60'),
                        provinceCode: this.provinceCode,
                        province: this.province,
                        cityCode: this.cityCode,
                        city: this.city,
                        areaCode: this.areaCode,
                        area: this.area,
                        image: this.image,
                        trainStoreName: this.trainStoreName,
                        trainStoreTypeCode: this.trainStoreTypeCode,
                        trainStoreType: this.trainStoreType,
                        trainStoreLevelCode: this.trainStoreLevelCode,
                        trainStoreLevel: this.trainStoreLevel,
                        trainStoreArea: this.trainStoreArea,
                        useableArea: this.useableArea,
                        goodsTotal: this.goodsTotal,
                        yearThroughput: this.yearThroughput,
                        contact: this.contact,
                        address: this.address,
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