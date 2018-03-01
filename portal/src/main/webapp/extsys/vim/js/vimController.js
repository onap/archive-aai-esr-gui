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
            "cloudOwner": "ZTE",
            "status": "active",
            "cloudRegionId": "",
            "cloudType": "openstack",
            "cloudRegionVersion": "v1.0",
            "ownerDefinedType": "",
            "cloudZone": "",
            "physicalLocationId": "",
            "cloudExtraInfo": "",
            "vimAuthInfos": [
                {
                    "userName": "",
                    "password": "",
                    "authUrl": "",
                    "sslCacert": "",
                    "sslInsecure": "false",
                    "cloudDomain": "",
                    "defaultTenant": ""
                }
            ]
        },
        vimTypeObj: [],
        vimTypes: [],
        vimVersions:[],
        physicalLocationIds:[],
        $Status: {
            success: "active",
            failed: "inactive",
            displayActive: $.i18n.prop('com_zte_ums_eco_roc_vim_normal'),
            displayInactive: $.i18n.prop('com_zte_ums_eco_roc_vim_abnormal')
        },
        isSave: true,
        action: {ADD: 'add', UPDATE: 'update'},
        $queryVimInfoUrl: '/api/aai-esr-server/v1/vims',
        $addVimInfoUrl: '/api/aai-esr-server/v1/vims',
        $updateVimInfoUrl: '/api/aai-esr-server/v1/vims/{cloudOwner}/{cloudRegionId}',
        $delVimInfoUrl: '/api/aai-esr-server/v1/vims/{cloudOwner}/{cloudRegionId}',
        $queryComplexInfoUrl: '/api/aai-esr-server/v1/vims/complexes',
        $queryVimTypeUrl: '/multicloud/v0/vim_types',
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
            vm.getPhysicalLocationIds();
            vm.getVimTypes();
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
            } else {
                vm.isSave = true;
            }
            var cloudOwner = vm.currentElement["cloudOwner"];
            var $cloudOwner = $("#vim_form input[name='cloudOwner']");
            var cloudRegionId  = vm.currentElement["cloudRegionId"];
            var $cloudRegionId = $("#vim_form input[name='cloudRegionId']");
            if(cloudOwner.indexOf("_") != -1){
                $cloudOwner.parent().parent().addClass("has-error");
                $cloudOwner.next().html("It not allowed '_' contained here").show();
                vm.isSave = false;
                return false;
            } else {
                vm.isSave = true;
                $cloudOwner.parent().parent().removeClass("has-error");
                $cloudOwner.next().hide();
            }
            if(cloudRegionId.indexOf("_") != -1){
                $cloudRegionId.parent().parent().addClass("has-error");
                $cloudRegionId.next().html("It not allowed '_' contained here").show();
                vm.isSave = false;
                return false;
            } else {
                vm.isSave = true;
                $cloudRegionId.parent().parent().removeClass("has-error");
                $cloudRegionId.next().hide();
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
            var res = false;
            $.ajax({
                type: "Post",
                url: vm.$addVimInfoUrl,
                data: JSON.stringify(newElement),
                async: false,
                dataType: "json",
                contentType: 'application/json',
                success: function (data, statusText, jqXHR) {
                    vm.executeWait.visible = false;
                    vm.executeError.visible = false;
                    if (jqXHR.status == "200") {
                        vm.vimInfo.push(newElement);
                        res = true;
                        $('#addVimDlg').modal('hide');
                        resUtil.growl($.i18n.prop("com_zte_ums_eco_roc_vim_growl_msg_title") + $.i18n.prop("com_zte_ums_eco_roc_vim_growl_msg_save_success"), "success");
                    } else {
                        res = false;
                        vm.executeError.visible = true;
                        vm.executeError.text = $.i18n.prop("com_zte_ums_eco_roc_vim_growl_msg_save_failed");
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    res = false;
                    vm.executeError.visible = true;
                    vm.executeError.text = textStatus + ":" + errorThrown;
                    vm.executeWait.visible = false;
                    vm.isSave = false;
                }
            });
            return res;
        },
        //update vim
        updateVim: function () {
            var currentElement = vm.getVIMSave();
            var res = false;
            var url = vm.$updateVimInfoUrl.replace("{cloudOwner}", currentElement["cloudOwner"]).replace("{cloudRegionId}", currentElement["cloudRegionId"]);
           $.ajax({
                type: "Put",
                url: url,
                contentType: 'application/json',
                data: JSON.stringify(currentElement),
                dataType: "json",
                async: false,
                success: function (data, statusText, jqXHR) {
                    vm.executeWait.visible = false;
                    vm.executeError.visible = false;
                    if (jqXHR.status == "200") {
                        vm.fillElement(currentElement, vm.vimInfo[vm.currentIndex]);
                        res = true;
                        $('#addVimDlg').modal('hide');
                        resUtil.growl($.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_title') + $.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_save_success'), "success");
                    }
                    else {
                        res = true;
                        vm.executeError.visible = true;
                        vm.executeError.text = $.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_save_failed');
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    res = true;
                    vm.isSave = false;
                    vm.executeError.visible = true;
                    vm.executeError.text = textStatus + ":" + errorThrown;
                    vm.executeWait.visible = false;
                }
            });
            return res;
        },
        delVim: function (index) {
            bootbox.confirm($.i18n.prop('com_zte_ums_eco_roc_vim_confirm_delete_vim_record'), function (result) {
                if (result) {
                    var cloudOwner = vm.vimInfo[index]["cloudOwner"];
                    var cloudRegionId = vm.vimInfo[index]["cloudRegionId"];
                    var url = vm.$delVimInfoUrl.replace('{cloudOwner}', cloudOwner).replace('{cloudRegionId}', cloudRegionId);
                    $.ajax({
                        type: "DELETE",
                        url: url,
                        success: function (data, statusText, jqXHR) {
                            if (jqXHR.status == "204") {
                                vm.vimInfo.splice(index, 1);
                                resUtil.growl($.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_title') + $.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_remove_success'), "success");
                            }
                            else {
                                resUtil.growl($.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_title') + $.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_remove_failed'), "warning");
                            }
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            resUtil.growl($.i18n.prop('com_zte_ums_eco_roc_vim_growl_msg_title') + errorThrown, "danger");
                        }
                    });
                }
            });
        },
        fillElement: function (sourceElement, targetElement) {
            targetElement["cloudOwner"] = sourceElement["cloudOwner"];
            targetElement["status"] = sourceElement["status"];
            targetElement["cloudRegionId"] = sourceElement["cloudRegionId"];
            targetElement["cloudType"] = sourceElement["cloudType"];
            targetElement["cloudRegionVersion"] = sourceElement["cloudRegionVersion"];
            targetElement["ownerDefinedType"] = sourceElement["ownerDefinedType"];
            targetElement["cloudZone"] = sourceElement["cloudZone"];
            targetElement["physicalLocationId"] = sourceElement["physicalLocationId"];
            targetElement["cloudExtraInfo"] = sourceElement["cloudExtraInfo"];
            if(!targetElement["vimAuthInfos"]){
                targetElement["vimAuthInfos"] = [{}];
            }
            targetElement["vimAuthInfos"][0]["userName"] = sourceElement["vimAuthInfos"][0]["userName"];
            targetElement["vimAuthInfos"][0]["password"] = sourceElement["vimAuthInfos"][0]["password"];
            targetElement["vimAuthInfos"][0]["authUrl"] = sourceElement["vimAuthInfos"][0]["authUrl"];
            targetElement["vimAuthInfos"][0]["sslCacert"] = sourceElement["vimAuthInfos"][0]["sslCacert"];
            targetElement["vimAuthInfos"][0]["sslInsecure"] = sourceElement["vimAuthInfos"][0]["sslInsecure"];
            targetElement["vimAuthInfos"][0]["cloudDomain"] = sourceElement["vimAuthInfos"][0]["cloudDomain"];
            targetElement["vimAuthInfos"][0]["defaultTenant"] = sourceElement["vimAuthInfos"][0]["defaultTenant"];
        },
        getVIMSave: function () {
            var vimSave = $.extend(true, {}, vm.currentElement.$model);
            vimSave["vimAuthInfos"] = $.extend(true, [], vm.currentElement["vimAuthInfos"].$model);
            return vimSave;
        },
        getVimTypes: function(){
            // vm.vimTypeObj = [{
            //     "vim_type": "openstack",
            //     "versions": ["titanium_cloud","ocata"]
            // },
            // {
            //     "vim_type": "vmware",
            //     "versions": ["4.0"]
            // },
            // {
            //     "vim_type": "test",
            //     "versions": ["1.0","2.0"]
            // }];
            $.ajax({
                "type": 'get',
                "url": vm.$queryVimTypeUrl,
                "success": function (resp, statusText, jqXHR) {
                    if (jqXHR.status == "200") {
                        vm.vimTypeObj = resp;
                    }
                    else {
                        vm.vimTypeObj = [];
                        bootbox.alert($.i18n.prop("com_zte_ums_eco_roc_vim_growl_msg_query_vim_type_failed"));
                        return;
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    bootbox.alert($.i18n.prop("com_zte_ums_eco_roc_vim_growl_msg_query_vim_type_failed") + textStatus + ":" + errorThrown);
                    return;
                },
                complete: function () {
                    resUtil.tooltipVimStatus();
                }
            });
            vm.getVimVerions(vm.vimTypeObj[0]["vim_type"]);
        },
        getPhysicalLocationIds: function(){
            $.ajax({
                "type": 'get',
                "url": vm.$queryComplexInfoUrl,
                "success": function (resp, statusText, jqXHR) {
                    if (jqXHR.status == "200") {
                        vm.physicalLocationIds = resp;
                    }
                    else {
                        vm.physicalLocationIds = [];
                        bootbox.alert($.i18n.prop("com_zte_ums_eco_roc_vim_growl_msg_query_complex_failed"));
                        return;
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    bootbox.alert($.i18n.prop("com_zte_ums_eco_roc_vim_growl_msg_query_complex_failed") + textStatus + ":" + errorThrown);
                    return;
                },
                complete: function () {
                    resUtil.tooltipVimStatus();
                }
            });
        },
        getVimVerions: function(vim_type){
            for (var i=0;i<vm.vimTypeObj.length;i++) {
                if(vim_type == vm.vimTypeObj[i]["vim_type"]) {
                    vm.vimVersions = vm.vimTypeObj[i]["versions"];
                }
            }
        }
    });
vm.currentElement = $.extend(true, {}, vm.$blankElement);
avalon.scan();
vm.$initTable();




