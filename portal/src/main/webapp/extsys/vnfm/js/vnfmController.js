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
        $id: "vnfmController",
        vnfmInfo: [],
        currentElement: {},
        currentIndex: 0,
        saveType: "add",
        $vnfmList: [],
        $newElement: {
            "vnfmId": "",
            "name": "",
            "type": "Tacker",
            "vimId": "",
            "vendor": "ZTE",
            "version": "v1.0",
            "certificateUrl": "",
            "url": "http://",
            "userName": "",
            "password": ""
        },
        saveType: "add",
        modalTitle: $.i18n.prop("nfv-ems-iui-text-register"),
        server_rtn: {
            info_block: false,
            warning_block: false,
            rtn_info: "",
            $RTN_SUCCESS: "RTN_SUCCESS",
            $RTN_FAILED: "RTN_FAILED"
        },
        $Status: {
            success: "active",
            failed: "inactive"
        },
        $restUrl: {
            queryVnfmInfoUrl: '/api/aai-esr-server/v1/vnfms',
            addVnfmInfoUrl: '/api/aai-esr-server/v1/vnfms',
            updateVnfmInfoUrl: '/api/aai-esr-server/v1/vnfms/{vnfmId}',
            delVnfmInfoUrl: '/api/aai-esr-server/v1/vnfms/{vnfmId}'
        },
        $htmlText: {
            saveSuccess: $.i18n.prop("nfv-vnfm-iui-message-save-success"),
            saveFail: $.i18n.prop("nfv-vnfm-iui-message-save-fail"),
            alreadyExist: $.i18n.prop("nfv-vnfm-iui-message-vnfm-already-exists"),
            updateSuccess: $.i18n.prop("nfv-vnfm-iui-message-update-success"),
            updateFail: $.i18n.prop("nfv-vnfm-iui-message-update-fail")
        },
        $initTable: function () {
            $.ajax({
                "type": 'GET',
                "url": vm.$restUrl.queryVnfmInfoUrl,
                "dataType": "json",
                "success": function (resp, statusText, jqXHR) {
                    if(jqXHR.status == 200){
                        vm.vnfmInfo = resp;
                        vm.$vnfmList =  $.extend(true, [], resp) ;
                    } else {
                        bootbox.alert($.i18n.prop("nfv-vnfm-iui-message-query-fail") + "：" + textStatus + ":" + errorThrown);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    bootbox.alert($.i18n.prop("nfv-vnfm-iui-message-query-fail") + "：" + textStatus + ":" + errorThrown);
                    return;
                },
                complete: function () {
                    vnfmUtil.tooltipVnfmStatus();
                }
            });
        },
        $showVnfmTable: function () {
            $(".form-group").each(function () {
                $(this).removeClass('has-success');
                $(this).removeClass('has-error');
                $(this).find(".help-block[id]").remove();
            });
            $("#addVnfmDlg").modal("show");
        },
        $saveVnfm: function () {
            var form = $('#vnfm_form');
            if (form.valid() == false) {
                return false;
            }
            //save VIM info
            if (vm.saveType == "add") {
                vm.postVnfm();
            } else {
                vm.putVnfm();
            }
        },
        registerVnfm: function () {
            vm.saveType = "add";
            vm.currentIndex = -1;
            vm.modalTitle = "Register";
            vm.currentElement = $.extend(true, {}, vm.$newElement);
            vm.$showVnfmTable();
        },
        delVnfm: function (id, index) {
            bootbox.confirm($.i18n.prop("nfv-vnfm-iui-message-delete-confirm"), function (result) {
                if (result) {
                    var vnfmId = vm.vnfmInfo[index]["vnfmId"];
                    var url = vm.$restUrl.delVnfmInfoUrl.replace("{vnfmId}", vnfmId)
                    $.ajax({
                        type: "DELETE",
                        url: url,
                        dataType: "json",
                        success: function (data, statusText, jqXHR) {
                            if (jqXHR.status == "204") {
                                vm.vnfmInfo.splice(index, 1);
                                vm.$vnfmList.splice(index, 1);
                                commonUtil.showMessage($.i18n.prop("nfv-vnfm-iui-message-delete-success"), "success");
                            } else {
                                commonUtil.showMessage($.i18n.prop("nfv-vnfm-iui-message-delete-fail"), "warning");
                            }
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            commonUtil.showMessage($.i18n.prop("nfv-vnfm-iui-message-delete-fail"), "warning");
                        }
                    });
                }
            });
        },
        updateVnfm: function (index) {
            vm.saveType = "update";
            vm.currentIndex = index;
            vm.modalTitle = "Modify";
            vm.currentElement = $.extend(true, {}, vm.vnfmInfo[index].$model);
            vm.$showVnfmTable();
        },
        postVnfm: function () {
            var currentElement = vm.getVnfmSave();
            $.ajax({
                type: "POST",
                url: vm.$restUrl.addVnfmInfoUrl,
                data: JSON.stringify(currentElement),
                dataType: "json",
                contentType: "application/json",
                success: function (resp, statusText, jqXHR) {
                    if (jqXHR.status == 200) {
                        currentElement.vnfmId = resp.id;
                        vm.vnfmInfo.push(currentElement);
                        $('#addVnfmDlg').modal('hide');
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
            });
        },
        putVnfm: function () {
            var currentElement = vm.getVnfmSave();
            var url = vm.$restUrl.updateVnfmInfoUrl .replace("{vnfmId}", currentElement.vnfmId);
            $.ajax({
                type: "PUT",
                url: url,
                data: JSON.stringify(currentElement),
                dataType: "json",
                contentType: "application/json",
                success: function (resp, statusText, jqXHR) {
                    if (jqXHR.status == 200) {
                        vm.fillElement(currentElement, vm.vnfmInfo[vm.currentIndex]);
                        $('#addVnfmDlg').modal('hide');
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
            });
        },
        fillElement: function (sourceElement, targetElement) {
            targetElement["vnfmId"] = sourceElement["vnfmId"];
            targetElement["name"] = sourceElement["name"];
            targetElement["type"] = sourceElement["type"];
            targetElement["vimId"] = sourceElement["vimId"];
            targetElement["vendor"] = sourceElement["vendor"];
            targetElement["version"] = sourceElement["version"];
            targetElement["certificateUrl"] = sourceElement["certificateUrl"];
            targetElement["url"] = sourceElement["url"];
            targetElement["userName"] = sourceElement["userName"];
            targetElement["password"] = sourceElement["password"];
        },
        getVnfmSave: function () {
            var vnfmSave = $.extend(true, {}, vm.currentElement.$model);
            return vnfmSave;
        }
});
vm.currentElement = $.extend(true, {}, vm.$newElement);
avalon.scan();
vm.$initTable();