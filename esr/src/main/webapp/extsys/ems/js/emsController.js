/*
 * Copyright 2016-2017 ZTE Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var vm = avalon.define({
        $id: "emsController",
        emsInfo: [],
        currentElement: {},
        $emsList: [],
        $newElement: {
            "emsId": "",
            "status": "active",
            "emsName": "",
            "version": "v1.0",
            "vendor": "ZTE",
            "description": "ems description",
            "resource": {
                "ftptype": "ftp",
                "ip": "",
                "port": "",
                "user": "root",
                "password": "",
                "remotepath": "/opt/Gcp/data/",
                "passive": true
            },
            "performance": {
                "ftptype": "ftp",
                "ip": "",
                "port": "",
                "user": "root",
                "password": "",
                "remotepath": "",
                "passive": true
            },
            "alarm": {
                "ip": "",
                "port": 2000,
                "user": "root",
                "password": ""
            }
        },
        vimSelectItems: [],
        saveType: "add",
        server_rtn: {
            info_block: false,
            warning_block: false,
            rtn_info: "",
            $RTN_SUCCESS: "RTN_SUCCESS",
            $RTN_FAILED: "RTN_FAILED"
        },
        modalTitle: $.i18n.prop("nfv-ems-iui-text-register"),
        urlTip: "",
        currentStep: 1,
        status: {
            success: "active",
            failed: "inactive"
        },
        $format: {
            "ipv4": /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/,
            "port": /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
            "url": /^(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?$/
        },
        $restUrl: {
            queryEmsInfoUrl: "/esrui/extsys/ems/mock-data/ems.json",//'/onapapi/aai/esr/v1/ems',
            addVnfmInfoUrl: '/onapapi/aai/esr/v1/ems',
            updateVnfmInfoUrl: '/onapapi/aai/esr/v1/ems/',
            delVnfmInfoUrl: '/onapapi/aai/esr/v1/ems/',
            queryMocUrl: '',
            queryVimUrl: '/onapapi/aai/esr/v1/vims'
        },
        $htmlText: {
            saveSuccess: $.i18n.prop("nfv-ems-iui-message-save-success"),
            saveFail: $.i18n.prop("nfv-ems-iui-message-save-fail"),
            alreadyExist: $.i18n.prop("nfv-ems-iui-message-ems-already-exists"),
            updateSuccess: $.i18n.prop("nfv-ems-iui-message-update-success"),
            updateFail: $.i18n.prop("nfv-ems-iui-message-update-fail")
        },
        $initTable: function () {
            $.ajax({
                "type": 'GET',
                "url": vm.$restUrl.queryEmsInfoUrl,
                "dataType": "json",
                "success": function (resp) {
                    vm.emsInfo = resp;
                    vm.$emsList = $.extend(true, [], resp) ;
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    bootbox.alert($.i18n.prop("nfv-ems-iui-message-query-fail") + "：" + textStatus + ":" + errorThrown);
                    return;
                },
                complete: function () {
                    $("[data-toggle='tooltip']").tooltip();
                }
            });
        },
        $nextStep: function () {
            if(vm.currentStep == 1 && !vm.validate("resource")){
                 return false;
            } else if(vm.currentStep == 2 && !vm.validate("performance")){
                return false;
            }
            vm.currentStep ++;
            vm.showStep();
        },
        $preStep: function () {
            if(vm.currentStep == 2 && !vm.validate("resource")){
                return false;
            } else if(vm.currentStep == 3 && !vm.validate("alarm")){
                return false;
            }
            vm.currentStep --;
            vm.showStep();
        },
        showStep: function () {
            var show = function (filter) {
                $(".px-ui-steps ul li.step-active").removeClass("step-active");
                $("#step-" + filter).addClass("step-active");
                $(".step-content form").hide();
                $("#form_" + filter).show();
            };
            switch (vm.currentStep){
                case 1:
                    show("resource");
                    $("#btnSave, #btnPreStep").hide();
                    $("#btnNextStep").show();
                    break;
                case 2:
                    show("performance");
                    $("#btnSave").hide();
                    $("#btnNextStep, #btnPreStep").show();
                    break;
                case 3:
                    show("alarm");
                    $("#btnNextStep").hide();
                    $("#btnSave, #btnPreStep").show();
                    break;
            }
        },
        $registerEMS: function () {
            vm.currentElement = $.extend(true, {}, vm.$newElement);
            vm.currentIndex = -1;
            vm.saveType = "add";
            vm.modalTitle = $.i18n.prop("nfv-ems-iui-text-register");
            vm.$showTable();
        },
        $showTable: function () {
            vm.currentStep = 1;
            vm.showStep();
            $(".form-group").removeClass('has-success').removeClass('has-error');
            $("#addEmsDlg").modal("show");
        },
        dismiss: function () {
            if(vm.currentIndex !== -1){
                vm.currentElement.emsName = vm.$emsList[vm.currentIndex].emsName;
            }
            $("#addEmsDlg").modal("hide");
        },
        $saveEMS: function () {
            var form = $('#vnfm_form');
           //TODO valiate
            vm.server_rtn.info_block = true;
            vm.server_rtn.warning_block = false;

            //save VIM info
            var res = false;
            if (vm.saveType == "add") {
                res = vm.postEMS();
            } else {
                res = vm.putEMS();
            }
            if(res){
                $("#addEmsDlg").modal("hide");
            }
        },
        updateEMS: function (index) {
            vm.saveType = "update";
            vm.currentIndex = index;
            vm.currentElement = vm.emsInfo[index];
            vm.$showTable();
        },
        delEMS: function (id, index) {
            bootbox.confirm($.i18n.prop("nfv-ems-iui-message-delete-confirm"), function (result) {
                if (result) {
                    vm.emsInfo.splice(index, 1);
                    vm.$emsList.splice(index, 1);
                    console.log(vm.emsInfo[index]);
                   /* $.ajax({
                        type: "DELETE",
                        url: vm.$restUrl.delVnfmInfoUrl + id,
                        dataType: "json",
                        success: function (data, statusText, jqXHR) {
                            if (jqXHR.status == "204") {

                                commonUtil.showMessage($.i18n.prop("nfv-ems-iui-message-delete-success"), "success");
                            } else {
                                commonUtil.showMessage($.i18n.prop("nfv-ems-iui-message-delete-fail"), "warning");
                            }
                        },
                        error: function () {
                            commonUtil.showMessage($.i18n.prop("nfv-ems-iui-message-delete-fail"), "warning");
                        }
                    });*/
                }
            });
        },
        validate: function (formId) {
            var res = true;
            var emsSave = vm.getEMSSave();
            var ip = emsSave[formId].ip;
            var port = emsSave[formId].port;
            if(!vm.$format.ipv4.test(ip)){
                $("#form_" + formId + " input[name='ip']").next().html("The IP format is incorrect");
                res = res && false;
            } else {
                $("#form_" + formId + " input[name='ip']").next().html("");
            }
            if(!vm.$format.port.test(port)){
                $("#form_" + formId + " input[name='port']").next().html("The port format is incorrect");
                res = res && false;
            } else {
                $("#form_" + formId + " input[name='port']").next().html("");
            }
            return res;
        },
        postEMS: function () {
            var emsSave = vm.getEMSSave();
            if(!vm.validate("alarm")){
                return false;
            }
            emsSave.emsId = Math.floor(Math.random() * 100000) / 100000;
            vm.emsInfo.push(emsSave);
            vm.$emsList.push(emsSave);
            console.log(emsSave);
            return true;
            /*$.ajax({
                type: "POST",
                url: vm.$restUrl.addVnfmInfoUrl,
                data: JSON.stringify(vm.currentElement),
                dataType: "json",
                contentType: "application/json",
                success: function (data) {
                    vm.server_rtn.info_block = false;
                    vm.server_rtn.warning_block = false;
                    if (data) {
                        vm.vnfmInfo = [];
                        vm.$initTable();

                        $('#addEmsDlg').modal('hide');
                        commonUtil.showMessage(vm.$htmlText.saveSuccess, "success");
                    } else {
                        vm.server_rtn.warning_block = true;
                        vm.server_rtn.rtn_info = vm.$htmlText.saveFail;
                        commonUtil.showMessage(vm.$htmlText.saveFail, "failed");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    vm.server_rtn.warning_block = true;
                    vm.server_rtn.rtn_info = textStatus + ":" + errorThrown;
                    vm.server_rtn.info_block = false;
                }
            });*/
        },
        putEMS: function () {
            console.log(vm.getEMSSave());
            if(!vm.validate("alarm")){
                return false;
            }
            return true;
           /* $.ajax({
                type: "PUT",
                url: vm.$restUrl.updateVnfmInfoUrl + vm.currentElement.emsId,
                data: JSON.stringify(vm.currentElement),
                dataType: "json",
                contentType: "application/json",
                success: function (data) {
                    vm.server_rtn.info_block = false;
                    vm.server_rtn.warning_block = false;
                    if (data) {
                        for (var i = 0; i < vm.vnfmInfo.length; i++) {
                            if (vm.vnfmInfo[i].vnfmId == vm.addVnfm.vnfmId) {
                                vm.vnfmInfo[i].name = vm.addVnfm.name;
                                vm.vnfmInfo[i].vimId = $("#vimId").val();
                                vm.vnfmInfo[i].vendor = vm.addVnfm.vendor;
                                vm.vnfmInfo[i].version = vm.addVnfm.version;
                                vm.vnfmInfo[i].certificateUrl = vm.addVnfm.certificateUrl;
                                vm.vnfmInfo[i].description = vm.addVnfm.description;
                                vm.vnfmInfo[i].url = vm.addVnfm.url;
                                vm.vnfmInfo[i].userName = vm.addVnfm.userName;
                                vm.vnfmInfo[i].password = vm.addVnfm.password;
                            }
                        }
                        $('#addEmsDlg').modal('hide');
                        commonUtil.showMessage(vm.$htmlText.updateSuccess, "success");
                    } else {
                        vm.server_rtn.warning_block = true;
                        vm.server_rtn.rtn_info = vm.$htmlText.updateFail;
                        commonUtil.showMessage(vm.$htmlText.updateFail, "failed");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    vm.server_rtn.warning_block = true;
                    vm.server_rtn.rtn_info = textStatus + ":" + errorThrown;
                    vm.server_rtn.info_block = false;
                }
            });*/
        },
        getEMSSave: function () {
            var emsSave = $.extend(true, {}, vm.currentElement.$model);
            emsSave.alarm = vm.currentElement.alarm.$model;
            emsSave.resource = vm.currentElement.resource.$model;
            emsSave.performance = vm.currentElement.performance.$model;
            return emsSave;
        }
    });
vm.currentElement = $.extend(true, {}, vm.$newElement);
avalon.scan();
vm.$initTable();