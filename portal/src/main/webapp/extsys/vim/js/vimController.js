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
        $id: "vimController",
        vimInfo: [],
        executeWait: {clazz: 'alert-info', visible: true, text: $.i18n.prop('com_zte_ums_eco_roc_vim_checking_status')},
        executeError: {clazz: 'alert-danger', visible: true, text: 'error'},
        currentElement: {},
        currentIndex: -1,
        saveType: "add",
        modalTitle: $.i18n.prop('com_zte_ums_eco_roc_vim_register'),
        $blankElement: {
            "cloud-owner": "ZTE",
            "status": "active",
            "cloud-region-id": "",
            "cloud-type": "openstack",
            "cloud-region-version": "v1.0",
            "owner-defined-type": "",
            "cloud-zone": "",
            "complex-name": "",
            "cloud-extra-info": "",
            "auth-info-items": [
                {
                    "username": "",
                    "password": "",
                    "auth-url": "",
                    "ssl-cacert": "",
                    "ssl-insecure": "",
                    "cloud-domain": ""
                }
            ]
        },
        $Status: {
            success: "active",
            failed: "inactive",
            displayActive: $.i18n.prop('com_zte_ums_eco_roc_vim_normal'),
            displayInactive: $.i18n.prop('com_zte_ums_eco_roc_vim_abnormal')
        },
        isSave: true,
        action: {ADD: 'add', UPDATE: 'update'},
        $queryVimInfoUrl: 'mock-data/vim.json',//'/onapapi/aai/esr/v1/vims',
        $addVimInfoUrl: '/onapapi/aai/esr/v1/vims/',
        $updateVimInfoUrl: '/onapapi/aai/esr/v1/vims/',
        $delVimInfoUrl: '/onapapi/aai/esr/v1/vims/{vim_id}',
        $initTable: function () {
            $.ajax({
                "type": 'get',
                "url": vm.$queryVimInfoUrl,
                "success": function (resp, statusText, jqXHR) {
                    if (jqXHR.status == "200") {
                        vm.vimInfo = resp;
                    }
                    else {
                        vm.vimInfo = [];
                        bootbox.alert($.i18n.prop("com_zte_ums_eco_roc_vim_growl_msg_query_failed"));
                        return;
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    bootbox.alert($.i18n.prop("com_zte_ums_eco_roc_vim_growl_msg_query_failed") + textStatus + ":" + errorThrown);
                    return;
                },
                complete: function () {
                    resUtil.tooltipVimStatus();
                }
            });

        },
        $showVimTable: function (index, action) {
            vm.isSave = false;
            vm.currentIndex = index;
            vm.saveType = action;
            if (vm.action.ADD == action) {
                vm.modalTitle = $.i18n.prop('com_zte_ums_eco_roc_vim_register');
                vm.fillElement(vm.$blankElement, vm.currentElement);
            } else {
                vm.modalTitle = $.i18n.prop('com_zte_ums_eco_roc_vim_modify_info');
                vm.fillElement(vm.vimInfo[index], vm.currentElement);
            }
            vm.$showModal();
        },
        $showModal: function () {
            $(".form-group").removeClass('has-success').removeClass('has-error').find(".help-block[id]").remove();
            $("#addVimDlg").modal("show");
        },
        $hideModal: function () {
            $(".form-group").removeClass('has-success').removeClass('has-error').find(".help-block[id]").remove();
            $("#addVimDlg").modal("hide");
        },
        $saveVimTable: function (index) {
            vm.isSave = true;
            if (form.valid() == false) {
                vm.isSave = false;
                return false;
            }
            var res = false;
            if (vm.saveType == "add") {
                res = vm.persistVim();
            } else if (vm.saveType == "update") {
                res = vm.updateVim();
            }
            if(res){
                vm.$hideModal();
            }
        },
        //add vim
        persistVim: function () {
            var newElement = vm.getVIMSave();
            vm.vimInfo.push(newElement);
            return true;
            /*$.ajax({
                type: "Post",
                url: vm.$addVimInfoUrl,
                data: JSON.stringify(vm.currentElement.$model),
                async: false,
                dataType: "json",
                contentType: 'application/json',
                success: function (data, statusText, jqXHR) {
                    vm.executeWait.visible = false;
                    vm.executeError.visible = false;
                    if (jqXHR.status == "201") {
                        vm.addVim.vimId = data.vimId;
                        vm.addVim.name = data.name;
                        vm.addVim.tenant = data.tenant;
                        vm.addVim.type = data.type;
                        var newVim = jQuery.extend({}, vm.addVim);
                        vm.vimInfo.push(newVim);

                        $('#addVimDlg').modal('hide');
                        resUtil.growl($.i18n.prop("com_zte_ums_eco_roc_vim_growl_msg_title") + $.i18n.prop("com_zte_ums_eco_roc_vim_growl_msg_save_success"), "success");
                    } else {
                        vm.executeError.visible = true;
                        vm.executeError.text = $.i18n.prop("com_zte_ums_eco_roc_vim_growl_msg_save_failed");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    vm.executeError.visible = true;
                    vm.executeError.text = textStatus + ":" + errorThrown;
                    vm.executeWait.visible = false;
                    vm.isSave = false;
                }
            });*/
        },
        //update vim
        updateVim: function () {
            vm.fillElement(vm.getVIMSave(), vm.vimInfo[vm.currentIndex]);
            return true;
           /* $.ajax({
                type: "Put",
                url: vm.$updateVimInfoUrl + vm.addVim.vimId,
                contentType: 'application/json',
                data: JSON.stringify(vm.currentElement.$model),
                dataType: "json",
                async: false,
                success: function (data, statusText, jqXHR) {
                    vm.executeWait.visible = false;
                    vm.executeError.visible = false;
                    if (jqXHR.status == "200") {
                        for (var i = 0; i < vm.vimInfo.length; i++) {
                            if (vm.vimInfo[i].vimId == vm.addVim.vimId) {
                                vm.vimInfo[i].name = vm.addVim.vimName;
                                vm.vimInfo[i].userName = vm.addVim.userName;
                                vm.vimInfo[i].password = vm.addVim.password;
                                vm.vimInfo[i].url = vm.addVim.url;
                                vm.vimInfo[i].tenant = vm.addVim.tenant;
                                vm.vimInfo[i].domain = vm.addVim.domain;
                                vm.vimInfo[i].description = vm.addVim.description;
                                vm.vimInfo[i].type = vm.addVim.vimType;
                                vm.vimInfo[i].version=vm.addVim.version;
                                vm.vimInfo[i].vendor=vm.addVim.vendor;
                            }
                        }
                        $('#addVimDlg').modal('hide');
                        resUtil.growl($.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_title') + $.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_save_success'), "success");
                    }
                    else {
                        vm.executeError.visible = true;
                        vm.executeError.text = $.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_save_failed');
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    vm.isSave = false;
                    vm.executeError.visible = true;
                    vm.executeError.text = textStatus + ":" + errorThrown;
                    vm.executeWait.visible = false;
                }
            });*/
        },
        delVim: function (index) {
            bootbox.confirm($.i18n.prop('com_zte_ums_eco_roc_vim_confirm_delete_vim_record'), function (result) {
                if (result) {
                    var id = vm.vimInfo[index]["id"];
                    vm.vimInfo.splice(index, 1);
                   /* $.ajax({
                        type: "DELETE",
                        url: vm.$delVimInfoUrl.replace('{vim_id}', el.vimId),
                        success: function (data, statusText, jqXHR) {
                            if (jqXHR.status == "204") {
                                for (var i = 0; i < vm.vimInfo.length; i++) {
                                    if (el.vimId == vm.vimInfo[i].vimId) {
                                        vm.vimInfo.splice(i, 1);
                                        break;
                                    }
                                }
                                resUtil.growl($.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_title') + $.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_remove_success'), "success");
                            }
                            else {
                                resUtil.growl($.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_title') + $.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_remove_failed'), "warning");
                            }
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            resUtil.growl($.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_title') + errorThrown, "danger");
                        }
                    });*/
                }
            });
        },
        fillElement: function (sourceElement, targetElement) {
            targetElement["cloud-owner"] = sourceElement["cloud-owner"];
            targetElement["status"] = sourceElement["status"];
            targetElement["cloud-region-id"] = sourceElement["cloud-region-id"];
            targetElement["cloud-type"] = sourceElement["cloud-type"];
            targetElement["cloud-region-version"] = sourceElement["cloud-region-version"];
            targetElement["owner-defined-type"] = sourceElement["owner-defined-type"];
            targetElement["cloud-zone"] = sourceElement["cloud-zone"];
            targetElement["complex-name"] = sourceElement["complex-name"];
            targetElement["cloud-extra-info"] = sourceElement["cloud-extra-info"];
            if(!targetElement["auth-info-items"]){
                targetElement["auth-info-items"] = [{}];
            }
            targetElement["auth-info-items"][0]["username"] = sourceElement["auth-info-items"][0]["username"];
            targetElement["auth-info-items"][0]["password"] = sourceElement["auth-info-items"][0]["password"];
            targetElement["auth-info-items"][0]["auth-url"] = sourceElement["auth-info-items"][0]["auth-url"];
            targetElement["auth-info-items"][0]["ssl-cacert"] = sourceElement["auth-info-items"][0]["ssl-cacert"];
            targetElement["auth-info-items"][0]["ssl-insecure"] = sourceElement["auth-info-items"][0]["ssl-insecure"];
            targetElement["auth-info-items"][0]["cloud-domain"] = sourceElement["auth-info-items"][0]["cloud-domain"];
        },
        getVIMSave: function () {
            var vimSave = $.extend(true, {}, vm.currentElement.$model);
            vimSave["auth-info-items"] = $.extend(true, {}, vm.currentElement["auth-info-items"].$model);
            return vimSave;
        },
        gotoChartPage: function (oid, name, tenant) {
            window.location.href = "vimChart.html?" + oid + "&" + name + "&" + tenant;
        }
    });
vm.currentElement = $.extend(true, {}, vm.$blankElement);
avalon.scan();
vm.$initTable();




