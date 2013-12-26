var moment = require('moment');

module.exports = function (orm, db) {
    var Port = db.define('port', {
            id: {type: 'text', required: true},
            provinceCode: {type: 'text', required: true},
            province: {type: 'text', required: true},
            cityCode: {type: 'text', required: true},
            city: {type: 'text', required: true},
            areaCode: {type: 'text'},
            area: {type: 'text'},
            portName: {type: 'text'},
            image: {type: 'text'},
            portTypeCode: {type: 'text', required: true},
            portType: {type: 'text', required: true},
            portLevelCode: {type: 'text', required: true},
            portLevel: {type: 'text', required: true},
            landArea: {type: 'number'},  //陆域面积,标准单位：平方米（m2）
            outWaterLine: {type: 'number'}, //水域外岸线,标准单位：米（m）
            berthNumber: {type: 'number'}, //泊位数量,标准单位：个
            useableBerthNumber: {type: 'number'}, //可用泊位数量,标准单位：个
            yearThroughput: {type: 'number'}, //年吞吐量,标准单位：吨
            harborWaterDepth: {type: 'number'}, //港池深度,标准单位：米（m）
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
            visitCount:{type:'number'},
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
                        provinceCode: this.provinceCode,
                        province: this.province,
                        cityCode: this.cityCode,
                        city: this.city,
                        areaCode: this.areaCode,
                        area: this.area,
                        image: this.image,
                        portName: this.portName,
                        portTypeCode: this.portTypeCode,
                        portType: this.portType,
                        portLevelCode: this.portLevelCode,
                        portLevel: this.portLevel,
                        landArea: this.landArea,
                        outWaterLine: this.outWaterLine,
                        berthNumber: this.berthNumber,
                        useableBerthNumber: this.useableBerthNumber,
                        yearThroughput: this.yearThroughput,
                        harborWaterDepth: this.harborWaterDepth,
                        contact: this.contact,
                        address: this.address,
                        tel: this.tel,
                        phone: this.phone,
                        valid: this.valid,
                        expiryDate: moment().format('YYYY-MM-DD HH:mm:ss'),
                        isDeleted: 0,//0:不删除，1:删除
                        status: 1,//0:不发布，1:发布
                        freeText: this.freeText,
                        visitCount:0,
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