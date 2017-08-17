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
        sdncList: [],
        currentElement: {},
        currentIndex: 0,
        $sdncList: [],
        $newElement: {
            "sdnControllerId":"a6c42529-cd6",
            "name":"sdnc1",
            "status": "active",
            "url":"",
            "userName":"admin",
            "password":"admin",
            "version":"v1.0",
            "vendor":"ZTE",
            "description":"",
            "protocol":"netconf",
            "productName":"",
            "type":"WAN"
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
        modalTitle: $.i18n.prop("nfv-sdnc-iui-text-register"),
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
            queryEmsInfoUrl: "/esrui/extsys/sdncontroller/mock-data/sdnc.json",//'/onapapi/aai/esr/v1/ems',
            addVnfmInfoUrl: '/onapapi/aai/esr/v1/ems',
            updateVnfmInfoUrl: '/onapapi/aai/esr/v1/ems/',
            delVnfmInfoUrl: '/onapapi/aai/esr/v1/ems/',
            queryMocUrl: '',
            queryVimUrl: '/onapapi/aai/esr/v1/vims'
        },
        $htmlText: {
            saveSuccess: $.i18n.prop("nfv-sdnc-iui-message-save-success"),
            saveFail: $.i18n.prop("nfv-sdnc-iui-message-save-fail"),
            alreadyExist: $.i18n.prop("nfv-sdnc-iui-message-ems-already-exists"),
            updateSuccess: $.i18n.prop("nfv-sdnc-iui-message-update-success"),
            updateFail: $.i18n.prop("nfv-sdnc-iui-message-update-fail")
        },
        $initTable: function () {
            $.ajax({
                "type": 'GET',
                "url": vm.$restUrl.queryEmsInfoUrl,
                "dataType": "json",
                "success": function (resp) {
                    vm.sdncList = resp;
                    vm.$sdncList = $.extend(true, [], resp) ;
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    bootbox.alert($.i18n.prop("nfv-sdnc-iui-message-query-fail") + "：" + textStatus + ":" + errorThrown);
                    return;
                },
                complete: function () {
                    $("[data-toggle='tooltip']").tooltip();
                }
            });
        },
       $registerSDNC: function () {
            vm.currentIndex = -1;
            vm.currentElement = $.extend(true, {}, vm.$newElement);
            vm.saveType = "add";
            vm.modalTitle = $.i18n.prop("nfv-sdnc-iui-text-register");
            vm.$showTable();
        },
        $showTable: function () {
            $(".form-group").removeClass('has-success').removeClass('has-error');
            $("#addEmsDlg").modal("show");
        },
        dismiss: function () {
            if(vm.currentIndex !== -1){
                vm.currentElement.name = vm.$sdncList[vm.currentIndex].name;
            }
            $("#addEmsDlg").modal("hide");
        },
        $saveSDNC: function () {
            var form = $('#vnfm_form');
           //TODO valiate
            vm.server_rtn.info_block = true;
            vm.server_rtn.warning_block = false;

            //save VIM info
            var res = false;
            if (vm.saveType == "add") {
                res = vm.postSDNC();
            } else {
                res = vm.putSDNC();
            }
            if(res){
                $("#addEmsDlg").modal("hide");
            }
        },
        updateSDNC: function (index) {
            vm.saveType = "update";
            vm.currentIndex = index;
            vm.currentElement = vm.sdncList[index];
            vm.$showTable();
        },
        delSDNC: function (id, index) {
            bootbox.confirm($.i18n.prop("nfv-sdnc-iui-message-delete-confirm"), function (result) {
                if (result) {
                    vm.sdncList.splice(index, 1);
                    vm.$sdncList.splice(index, 1);
                    console.log(vm.sdncList[index]);
                   /* $.ajax({
                        type: "DELETE",
                        url: vm.$restUrl.delVnfmInfoUrl + id,
                        dataType: "json",
                        success: function (data, statusText, jqXHR) {
                            if (jqXHR.status == "204") {

                                commonUtil.showMessage($.i18n.prop("nfv-sdnc-iui-message-delete-success"), "success");
                            } else {
                                commonUtil.showMessage($.i18n.prop("nfv-sdnc-iui-message-delete-fail"), "warning");
                            }
                        },
                        error: function () {
                            commonUtil.showMessage($.i18n.prop("nfv-sdnc-iui-message-delete-fail"), "warning");
                        }
                    });*/
                }
            });
        },
        postSDNC: function () {
            var emsSave = vm.getSDNCSave();
            emsSave.sdnControllerId = Math.floor(Math.random() * 100000) / 100000;
            vm.sdncList.push(emsSave);
            vm.$sdncList.push(emsSave);
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
        putSDNC: function () {
            console.log(vm.getSDNCSave());
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
        getSDNCSave: function () {
            var emsSave = $.extend(true, {}, vm.currentElement.$model);
            return emsSave;
        }
    });
vm.currentElement = $.extend(true, {}, vm.$newElement);
avalon.scan();
vm.$initTable();