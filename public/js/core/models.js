(function () {
var Line = function () {

  this.defineProperties({
    sProvinceCode: {type: 'string'},
    sProvince: {type: 'string'},
    sCityCode: {type: 'string'},
    sCity: {type: 'string'},
    sAreaCode: {type: 'string'},
    sArea: {type: 'string'},
    eProvinceCode: {type: 'string'},
    eProvince: {type: 'string'},
    eCityCode: {type: 'string'},
    eCity: {type: 'string'},
    eAreaCode: {type: 'string'},
    eArea: {type: 'string'},
    image: {type: 'string'},
    heavyCargoPrice: {type: 'string'},
    foamGoodsPrice: {type: 'string'},
    lineTypeCode: {type: 'string'},
    lineType: {type: 'string'},
    modeTransportCode: {type: 'string'},
    isDirect: {type: 'string'},
    transRateDay: {type: 'int'},
    transRateNumber: {type: 'int'},
    isFrozen: {type: 'int'},
    lineGoodsType: {type: 'string'},
    transTime: {type: 'string'},
    startContact: {type: 'string'},
    startAddress: {type: 'text'},
    startTel: {type: 'string'},
    startPhone: {type: 'string'},
    endContact: {type: 'string'},
    endAddress: {type: 'text'},
    endTel: {type: 'string'},
    endPhone: {type: 'string'},
    validate: {type: 'string'},
    expiryDate: {type: 'datetime'},
    status: {type: 'int'},
    freeText: {type: 'text'},
    eId: {type: 'string'},
    createrId: {type: 'string'},
    updaterId: {type: 'string'}
  });

  /*
  this.property('login', 'string', {required: true});
  this.property('password', 'string', {required: true});
  this.property('lastName', 'string');
  this.property('firstName', 'string');

  this.validatesPresent('login');
  this.validatesFormat('login', /[a-z]+/, {message: 'Subdivisions!'});
  this.validatesLength('login', {min: 3});
  // Use with the name of the other parameter to compare with
  this.validatesConfirmed('password', 'confirmPassword');
  // Use with any function that returns a Boolean
  this.validatesWithFunction('password', function (s) {
      return s.length > 0;
  });

  // Can define methods for instances like this
  this.someMethod = function () {
    // Do some stuff
  };
  */

};

/*
// Can also define them on the prototype
Line.prototype.someOtherMethod = function () {
  // Do some other stuff
};
// Can also define static methods and properties
Line.someStaticMethod = function () {
  // Do some other stuff
};
Line.someStaticProperty = 'YYZ';
*/

Line = geddy.model.register('Line', Line);
}());