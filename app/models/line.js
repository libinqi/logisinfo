var moment = require('moment');

module.exports = function (orm, db) {
        var Line = db.define('line', {
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
                    heavyCargoPrice: {type: 'text'},
                    foamGoodsPrice: {type: 'text'},
                    lineTypeCode: {type: 'text', required: true},
                    lineType: {type: 'text', required: true},
                    modeTransportCode: {type: 'text', required: true},
                    modeTransport: {type: 'text', required: true},
                    isDirect: {type: 'number', required: true},
                    transRateDay: {type: 'number'},
                    transRateNumber: {type: 'number'},
                    isFrozen: {type: 'number', required: true},
                    lineGoodsType: {type: 'text'},
                    transTime: {type: 'text'},
                    startContact: {type: 'text'},
                    startAddress: {type: 'text'},
                    startTel: {type: 'text'},
                    startPhone: {type: 'text'},
                    endContact: {type: 'text'},
                    endAddress: {type: 'text'},
                    endTel: {type: 'text'},
                    endPhone: {type: 'text'},
                    validate: {type: 'text'},
                    expiryDate: {type: 'date'},
                    status: {type: 'number'},
                    freeText: {type: 'text'},
                    eId: {type: 'text'},//关联企业的uuid
                    createrId: {type: 'text', required: true},//关联用户的uuid
                    createdAt : { type: 'date', required: true, time: true },
                    updaterId: {type: 'text'},//关联用户的uuid
                    updatedAt : { type: 'date',time: true }
        },
        {
                hooks: {
                        beforeValidation: function () {                    
                            this.createdAt = new Date();
                        }
                },
                validations: {
                    
                },
                methods: {
                        serialize: function () {
                            this.heavyCargoPrice=0; //0:面议 元/公斤
                            this.foamGoodsPrice=0; //0:面议 元/方
                            this.isDirect=1; //0:中转，1:直达
                            this.isFrozen=1; //0不固定，1固定
                            this.status=1; //0:不发布，1:发布
                        }
                }
        });
};