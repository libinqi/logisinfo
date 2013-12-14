var moment = require('moment');
var ids = require("../../util/ids");

module.exports = function (orm, db) {
    var TrainLine = db.define('trainLine', {
            id: {type: 'text', required: true},
            provinceCode: {type: 'text', required: true},
            province: {type: 'text', required: true},
            cityCode: {type: 'text', required: true},
            city: {type: 'text', required: true},
            areaCode: {type: 'text'},
            area: {type: 'text'},
            trainLineName: {type: 'text'},
            image: {type: 'text'},
            lineLength: {type: 'number'},  //线路长度,标准单位：千米（km）
            trainBoxNumber: {type: 'number'},//停放车皮总数量,标准单位：辆
            useableTrainBoxNumber: {type: 'number'}, //可停放车皮数量,标准单位：辆
            dayCapacity: {type: 'number'}, //日装卸量,标准单位：吨
            yearCapacity: {type: 'number'}, //年吞吐量,标准单位：吨
            yearShipments: {type: 'number'}, //年发货量,标准单位：吨
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
                        id: ids.GenerateId('70'),
                        provinceCode: this.provinceCode,
                        province: this.province,
                        cityCode: this.cityCode,
                        city: this.city,
                        areaCode: this.areaCode,
                        area: this.area,
                        image: this.image,
                        trainLineName: this.trainLineName,
                        lineLength: this.lineLength,
                        trainBoxNumber: this.trainBoxNumber,
                        useableTrainBoxNumber: this.useableTrainBoxNumber,
                        dayCapacity: this.dayCapacity,
                        yearCapacity: this.yearCapacity,
                        yearShipments: this.yearShipments,
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