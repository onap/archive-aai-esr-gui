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
        $id: "sdncController",
        sdncList: [],
        currentElement: {},
        currentIndex: 0,
        $sdncList: [],
        $newElement: {
            "thirdpartySdncId":"",
            "name":"sdnc1",
            "url":"",
            "location":"edge",
            "userName":"admin",
            "password":"",
            "version":"v1.0",
            "vendor":"ZTE",
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
            queryEmsInfoUrl: "/api/aai-esr-server/v1/sdncontrollers",
            addVnfmInfoUrl: '/api/aai-esr-server/v1/sdncontrollers',
            updateVnfmInfoUrl: '/api/aai-esr-server/v1/sdncontrollers/{thirdpartySdncId}',
            delVnfmInfoUrl: '/api/aai-esr-server/v1/sdncontrollers/{thirdpartySdncId}'
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
            if(!vm.validate()){
                return;
            }
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
            vm.fillElement(vm.sdncList[vm.currentIndex], vm.currentElement)
            vm.$showTable();
        },
        validate: function () {
            var res = true;
            var sdncSave = vm.getSDNCSave();
           var url = sdncSave.url;
            if(!vm.$format.url.test(url)){
                $("#form_sdnc input[name='url']").next().html("The url format is incorrect");
                res = res && false;
            } else {
                $("#form_sdnc input[name='url']").next().html("");
            }
            return res;
        },
        delSDNC: function (id, index) {
            bootbox.confirm($.i18n.prop("nfv-sdnc-iui-message-delete-confirm"), function (result) {
                if (result) {
                    var sdncId = vm.sdncList[index]["thirdpartySdncId"];
                    var url = vm.$restUrl.delVnfmInfoUrl.replace("{thirdpartySdncId}", sdncId)
                    $.ajax({
                        type: "DELETE",
                        url: url,
                        dataType: "json",
                        success: function (data, statusText, jqXHR) {
                            if (jqXHR.status == "204") {
                                vm.sdncList.splice(index, 1);
                                vm.$sdncList.splice(index, 1);
                                commonUtil.showMessage($.i18n.prop("nfv-sdnc-iui-message-delete-success"), "success");
                            } else {
                                commonUtil.showMessage($.i18n.prop("nfv-sdnc-iui-message-delete-fail"), "warning");
                            }
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            commonUtil.showMessage($.i18n.prop("nfv-sdnc-iui-message-delete-fail"), "warning");
                        }
                    });
                }
            });
        },
        postSDNC: function () {
            var res = false;
            var sdncSave = vm.getSDNCSave();
            $.ajax({
                type: "POST",
                url: vm.$restUrl.addVnfmInfoUrl,
                data: JSON.stringify(sdncSave),
                dataType: "json",
                contentType: "application/json",
                success: function (data, statusText, jqXHR) {
                    vm.server_rtn.info_block = false;
                    vm.server_rtn.warning_block = false;
                    if (jqXHR.status == "200") {
                        res = true;
                        sdncSave["thirdpartySdncId"] = data.id;
                        vm.sdncList.push(sdncSave);
                        vm.$sdncList.push(sdncSave);
                        $('#addEmsDlg').modal('hide');
                        commonUtil.showMessage(vm.$htmlText.saveSuccess, "success");
                    } else {
                        res = false;
                        vm.server_rtn.warning_block = true;
                        vm.server_rtn.rtn_info = vm.$htmlText.saveFail;
                        commonUtil.showMessage(vm.$htmlText.saveFail, "failed");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    res = false;
                    vm.server_rtn.warning_block = true;
                    vm.server_rtn.rtn_info = textStatus + ":" + errorThrown;
                    vm.server_rtn.info_block = false;
                }
            });
            return res;
        },
        putSDNC: function () {
            var res = false;
            var currentElement = vm.getSDNCSave();
            var url = vm.$restUrl.updateVnfmInfoUrl.replace("{thirdpartySdncId}", currentElement["thirdpartySdncId"]);
            $.ajax({
                type: "PUT",
                url: url,
                data: JSON.stringify(currentElement),
                dataType: "json",
                contentType: "application/json",
                success: function (data, statusText, jqXHR) {
                    vm.server_rtn.info_block = false;
                    vm.server_rtn.warning_block = false;
                    if (jqXHR.status == "200") {
                        res = true;
                        vm.fillElement(vm.currentElement, vm.sdncList[vm.currentIndex]);
                        $('#addEmsDlg').modal('hide');
                        commonUtil.showMessage(vm.$htmlText.updateSuccess, "success");
                    } else {
                        res = false;
                        vm.server_rtn.warning_block = true;
                        vm.server_rtn.rtn_info = vm.$htmlText.updateFail;
                        commonUtil.showMessage(vm.$htmlText.updateFail, "failed");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    res = false;
                    vm.server_rtn.warning_block = true;
                    vm.server_rtn.rtn_info = textStatus + ":" + errorThrown;
                    vm.server_rtn.info_block = false;
                }
            });
            return res;
        },
        sdncTypeChange: function (value) {
            var $sdncLocation = $("#sdncLocation");
            if("WAN" == value){
                $sdncLocation.hide();
                vm.currentElement.location = "";
            } else {
                $sdncLocation.show();
            }
        },
        fillElement: function (sourceElement, targetElement) {
            targetElement["thirdpartySdncId"] = sourceElement["thirdpartySdncId"];
            targetElement["name"] = sourceElement["name"];
            targetElement["url"] = sourceElement["url"];
            targetElement["location"] = sourceElement["location"];
            targetElement["userName"] = sourceElement["userName"];
            targetElement["password"] = sourceElement["password"];
            targetElement["version"] = sourceElement["version"];
            targetElement["vendor"] = sourceElement["vendor"];
            targetElement["protocol"] = sourceElement["protocol"];
            targetElement["productName"] = sourceElement["productName"];
            targetElement["type"] = sourceElement["type"];
        },
        getSDNCSave: function () {
            var emsSave = $.extend(true, {}, vm.currentElement.$model);
            return emsSave;
        }
    });
vm.currentElement = $.extend(true, {}, vm.$newElement);
avalon.scan();
vm.$initTable();