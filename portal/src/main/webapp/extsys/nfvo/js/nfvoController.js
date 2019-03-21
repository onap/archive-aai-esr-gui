/*
 * Copyright (C) 2019 Verizon. All Rights Reserved
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
        $id: "nfvoController",
        nfvoList: [],
        currentElement: {},
        currentIndex: 0,
        $nfvoList: [],
        $newElement: {
            "nfvoId":"",
            "name":"nfvo1",
            "url":"",
            "userName":"admin",
            "password":"",
            "version":"v1.0",
            "vendor":"vz",
            "apiroot":"/",
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
        modalTitle: $.i18n.prop("nfv-nfvo-iui-text-register"),
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
            queryNfvoInfoUrl: "/api/aai-esr-server/v1/nfvos",
            addNfvoInfoUrl: '/api/aai-esr-server/v1/nfvos',
            updateNfvoInfoUrl: '/api/aai-esr-server/v1/nfvos/{nfvoId}',
            delNfvoInfoUrl: '/api/aai-esr-server/v1/nfvos/{nfvoId}'
        },
        $htmlText: {
            saveSuccess: $.i18n.prop("nfv-nfvo-iui-message-save-success"),
            saveFail: $.i18n.prop("nfv-nfvo-iui-message-save-fail"),
            alreadyExist: $.i18n.prop("nfv-nfvo-iui-message-ems-already-exists"),
            updateSuccess: $.i18n.prop("nfv-nfvo-iui-message-update-success"),
            updateFail: $.i18n.prop("nfv-nfvo-iui-message-update-fail")
        },
        $initTable: function () {
            $.ajax({
                "type": 'GET',
                "url": vm.$restUrl.queryNfvoInfoUrl,
                "dataType": "json",
                "success": function (resp) {
                    vm.nfvoList = resp;
                    vm.$nfvoList = $.extend(true, [], resp) ;
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    bootbox.alert($.i18n.prop("nfv-nfvo-iui-message-query-fail") + "：" + textStatus + ":" + errorThrown);
                    return;
                },
                complete: function () {
                    $("[data-toggle='tooltip']").tooltip();
                }
            });
        },
       $registerNFVO: function () {
            vm.currentIndex = -1;
            vm.currentElement = $.extend(true, {}, vm.$newElement);
            vm.saveType = "add";
            vm.modalTitle = $.i18n.prop("nfv-nfvo-iui-text-register");
            vm.$showTable();
        },
        $showTable: function () {
            $(".form-group").removeClass('has-success').removeClass('has-error');
            $("#addNfvoDlg").modal("show");
        },
        dismiss: function () {
            if(vm.currentIndex !== -1){
                vm.currentElement.name = vm.$nfvoList[vm.currentIndex].name;
            }
            $("#addNfvoDlg").modal("hide");
        },
        $saveNFVO: function () {
            var form = $('#vnfm_form');
            if(!vm.validate()){
                return;
            }
            vm.server_rtn.info_block = true;
            vm.server_rtn.warning_block = false;

            //save VIM info
            var res = false;
            if (vm.saveType == "add") {
                res = vm.postNFVO();
            } else {
                res = vm.putNFVO();
            }
            if(res){
                $("#addNfvoDlg").modal("hide");
            }
        },
        updateNFVO: function (index) {
            vm.saveType = "update";
            vm.currentIndex = index;
            vm.fillElement(vm.nfvoList[vm.currentIndex], vm.currentElement);
            vm.$showTable();
        },
        validate: function () {
            var res = true;
            var nfvoSave = vm.getNFVOSave();
           var url = nfvoSave.url;
            if(!vm.$format.url.test(url)){
                $("#form_nfvo input[name='url']").next().html("The url format is incorrect");
                res = res && false;
            } else {
                $("#form_nfvo input[name='url']").next().html("");
            }
            return res;
        },
        delNFVO: function (id, index) {
            bootbox.confirm($.i18n.prop("nfv-nfvo-iui-message-delete-confirm"), function (result) {
                if (result) {
                    var nfvoId = vm.nfvoList[index]["nfvoId"];
                    var url = vm.$restUrl.delNfvoInfoUrl.replace("{nfvoId}", nfvoId)
                    $.ajax({
                        type: "DELETE",
                        url: url,
                        dataType: "json",
                        success: function (data, statusText, jqXHR) {
                            if (jqXHR.status == "204") {
                                vm.nfvoList.splice(index, 1);
                                vm.$nfvoList.splice(index, 1);
                                commonUtil.showMessage($.i18n.prop("nfv-nfvo-iui-message-delete-success"), "success");
                            } else {
                                commonUtil.showMessage($.i18n.prop("nfv-nfvo-iui-message-delete-fail"), "warning");
                            }
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            commonUtil.showMessage($.i18n.prop("nfv-nfvo-iui-message-delete-fail"), "warning");
                        }
                    });
                }
            });
        },
        postNFVO: function () {
            var res = false;
            var nfvoSave = vm.getNFVOSave();
            $.ajax({
                type: "POST",
                url: vm.$restUrl.addNfvoInfoUrl,
                data: JSON.stringify(nfvoSave),
                dataType: "json",
                contentType: "application/json",
                success: function (data, statusText, jqXHR) {
                    vm.server_rtn.info_block = false;
                    vm.server_rtn.warning_block = false;
                    if (jqXHR.status == "200") {
                        res = true;
                        nfvoSave["nfvoId"] = data.id;
                        vm.nfvoList.push(nfvoSave);
                        vm.$nfvoList.push(nfvoSave);
                        $('#addNfvoDlg').modal('hide');
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
        putNFVO: function () {
            var res = false;
            var currentElement = vm.getNFVOSave();
            var url = vm.$restUrl.updateNfvoInfoUrl.replace("{nfvoId}", currentElement["nfvoId"]);
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
                        vm.fillElement(vm.currentElement, vm.nfvoList[vm.currentIndex]);
                        $('#addNfvoDlg').modal('hide');
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
        fillElement: function (sourceElement, targetElement) {
            targetElement["nfvoId"] = sourceElement["nfvoId"];
            targetElement["name"] = sourceElement["name"];
            targetElement["url"] = sourceElement["url"];
            targetElement["userName"] = sourceElement["userName"];
            targetElement["password"] = sourceElement["password"];
            targetElement["version"] = sourceElement["version"];
            targetElement["vendor"] = sourceElement["vendor"];
            targetElement["apiroot"] = sourceElement["apiroot"];
        },
        getNFVOSave: function () {
            var emsSave = $.extend(true, {}, vm.currentElement.$model);
            console.log(emsSave);
            return emsSave;
        }
    });
vm.currentElement = $.extend(true, {}, vm.$newElement);
avalon.scan();
vm.$initTable();
