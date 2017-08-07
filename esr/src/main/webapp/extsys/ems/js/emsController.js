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

var vm = avalon
    .define({
        $id: "emsController",
        emsInfo: [],
        //mocSelectItems : [],
        vimSelectItems: [],
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
            queryEmsInfoUrl: '/openoapi/extsys/v1/emss',
            addEmsInfoUrl: '/openoapi/extsys/v1/emss',
            updateEmsInfoUrl: '/openoapi/extsys/v1/emss/',
            delEmsInfoUrl: '/openoapi/extsys/v1/emss/',
            queryMocUrl: '',
            queryVimUrl: '/openoapi/extsys/v1/vims'
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
                //"dataType": "json",
                "success": function (resp) {
                    for (var i = 0; i < resp.length; i++) {
                        resp[i].status = vm.$Status.success;
                    }
                    vm.emsInfo = resp;
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    bootbox.alert($.i18n.prop("nfv-ems-iui-message-query-fail") + "：" + textStatus + ":" + errorThrown);
                    return;
                },
                complete: function () {
                    emsUtil.tooltipEmsStatus();
                }
            });
        },

        $initVim: function () {
            $.ajax({
                type: 'get',
                url: vm.$restUrl.queryVimUrl,
                dataType: 'json',
                success: function (resp) {
                    if (resp) {
                        vm.vimSelectItems = resp;
                    }
                    vm.vimSelectItems.push({"vimId": "", "name": ""});
                }
            });
        },
        addEms: {
            title: $.i18n.prop("nfv-ems-iui-text-register"),
            emsId: "",
            name: "",
            type: "",
            //moc : "",
            nameReadonly : false,
            vimId: "",
            //vimVisiable : false,
            vendor: "",
            version: "",
            description: "",
            certificateUrl: "",
            url: "",
            urlTip: $.i18n.prop("nfv-ems-iui-text-url-tip"),
            userName: "",
            password: "",
            saveType: "add",
            status: ""
        },
        $showEmsTable: function () {
            vm.addEms.title = $.i18n.prop("nfv-ems-iui-text-register"),
                vm.addEms.emsId = "";
            vm.addEms.name = "";
            vm.addEms.type = "";
            vm.addEms.nameReadonly = false;
            vm.addEms.vimId = "";
            vm.addEms.vendor = "";
            vm.addEms.version = "";
            vm.addEms.description = "";
            vm.addEms.certificateUrl = "";
            vm.addEms.url = "";
            vm.addEms.userName = "";
            vm.addEms.password = "";
            vm.addEms.saveType = "add";
            vm.server_rtn.warning_block = false;
            vm.server_rtn.info_block = false;
            vm.$initVim();
            $(".form-group").each(function () {
                $(this).removeClass('has-success');
                $(this).removeClass('has-error');
                $(this).find(".help-block[id]").remove();
            });
            $("#addEmsDlg").modal("show");
        },
        // $getMocName : function(mocId) {
        //       	var items = vm.mocSelectItems;
        //           for(var i=0;i<items.length;i++) {
        //    		if(items[i].id == mocId) {
        //    			return items[i].name;
        //    		}
        //    	}
        //    	return "";
        // },
        $saveEms: function () {
            var form = $('#ems_form');
            if (form.valid() == false) {
                return false;
            }
            vm.server_rtn.info_block = true;
            vm.server_rtn.warning_block = false;
            vm.addEms.status = vm.$Status.success;

            var param = {
                name: vm.addEms.name,
                vimId: $("#vimId").val(),
                vendor: vm.addEms.vendor,
                version: vm.addEms.version,
                type: vm.addEms.type,
                description: vm.addEms.description,
                certificateUrl: vm.addEms.certificateUrl,
                url: vm.addEms.url,
                userName: vm.addEms.userName,
                password: vm.addEms.password
            }
            //save VIM info
            if (vm.addEms.saveType == "add") {     
                $.ajax({
                    type: "POST",
                    url: vm.$restUrl.addEmsInfoUrl,
                    data: JSON.stringify(param),
                    dataType: "json",
                    contentType: "application/json",
                    success: function (data) {
                        vm.server_rtn.info_block = false;
                        vm.server_rtn.warning_block = false;
                        if (data) {
                            vm.emsInfo = [];
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
                });
            } else {
                $.ajax({
                    type: "PUT",
                    url: vm.$restUrl.updateEmsInfoUrl + vm.addEms.emsId,
                    data: JSON.stringify(param),
                    dataType: "json",
                    contentType: "application/json",
                    success: function (data) {
                        vm.server_rtn.info_block = false;
                        vm.server_rtn.warning_block = false;
                        if (data) {
                            for (var i = 0; i < vm.emsInfo.length; i++) {
                                if (vm.emsInfo[i].emsId == vm.addEms.emsId) {
                                    vm.emsInfo[i].name = vm.addEms.name;
                                    vm.emsInfo[i].vimId = $("#vimId").val();
                                    vm.emsInfo[i].vendor = vm.addEms.vendor;
                                    vm.emsInfo[i].version = vm.addEms.version;
                                    vm.emsInfo[i].certificateUrl = vm.addEms.certificateUrl;
                                    vm.emsInfo[i].description = vm.addEms.description;
                                    vm.emsInfo[i].url = vm.addEms.url;
                                    vm.emsInfo[i].userName = vm.addEms.userName;
                                    vm.emsInfo[i].password = vm.addEms.password;
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
                });
            }
        },

        vimRendered: function (action) {
            var items = vm.vimSelectItems;
            if (vm.addEms.saveType === "update") {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].vimId == vm.addEms.vimId) {
                        $("#vimId")[0].selectedIndex = i;
                        break;
                    }
                }
            } else {
                $("#vimId")[0].selectedIndex = items.length - 1;
            }
        },

    });
avalon.scan();
vm.$initTable();
//vm.$initMoc();