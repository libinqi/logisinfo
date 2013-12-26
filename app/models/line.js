var moment = require('moment');

module.exports = function (orm, db) {
    var Line = db.define('line', {
            id: {type: 'text', required: true},
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
                        heavyCargoPrice: 0,//0:面议 元/公斤
                        foamGoodsPrice: 0,//0:面议 元/方
                        lineTypeCode: this.lineTypeCode,
                        lineType: this.lineType,
                        modeTransportCode: this.modeTransportCode,
                        modeTransport: this.modeTransport,
                        isDirect: 1, //0:中转，1:直达
                        transRateDay: this.transRateDay,
                        transRateNumber: this.transRateNumber,
                        isFrozen: 0, //0不固定，1固定
                        lineGoodsType: this.lineGoodsType,
                        transTime: this.transTime,
                        startContact: this.startContact,
                        startAddress: this.startAddress,
                        startTel: this.startTel,
                        startPhone: this.startPhone,
                        endContact: this.endContact,
                        endAddress: this.endAddress,
                        endTel: this.endTel,
                        endPhone: this.endPhone,
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