.. This work is licensed under a Creative Commons Attribution 4.0 International License.

New Features
------------

ONAP AAI-ESR items for: (Last Updated: 10/12/2017)

*    **Version**: Amsterdam Release
*    **Release Date**: 02 November, 2017
*    **Description**: R1
  
Story
^^^^^

* [AAI-64] - Move the seed code from Open-O to ONAP
* [AAI-65] - Realize the EMS register portal
* [AAI-66] - Change mysql data store backend to AAI
* [AAI-77] - Update POM to inherit from oparent
* [AAI-187] - Add docker build function for esr-server
* [AAI-188] - Add docker build function for esr-gui
* [AAI-204] - Add EMS/VNFM/SDNC register schema to A&AI
* [AAI-282] - Fix the critical sonar issue about esr-server
* [AAI-284] - Realize the data transaction between ESR rest and A&AI API
* [AAI-303] - Realize the VNFM management API
* [AAI-304] - Realize the EMS management API
* [AAI-305] - Realize the Thirdparty SDNC management API
* [AAI-330] - Add CSIT usecase for esr-server
* [AAI-331] - Add UNIT test for esr-server
* [AAI-345] - Integrate esr-server with esr-gui
* [AAI-378] - Add the document files for ESR
* [AAI-427] - Add document details for ESR

Task
^^^^

* [AAI-67] - Upload the server-end seed code to ONAP repository
* [AAI-68] - Upload the ESR gui seed code to ONAP repository
* [AAI-69] - Remove the original SDNC related function from Amsterdan release.
* [AAI-70] - Collect the schema of ESR for ONAP in Amsterdam release
* [AAI-137] - Setup A&AI Developer Environment
* [AAI-138] - Add CI task for ESR
* [AAI-143] - Remove the openo tag from esr-gui
* [AAI-144] - remove the openo tag from esr-server repository
* [AAI-145] - Fix the license of esr-server according to the ONAP license rule
* [AAI-166] - Add auth-info node for cloud-region to support VoLTE
* [AAI-181] - Add verification for the input data of SDNC portal
* [AAI-184] - Modify the VIM register card and property name
* [AAI-185] - Change the way of input cloud-region and version
* [AAI-186] - Add check function for cloud-owner and cloud-region-id
* [AAI-234] - Remove the lombok dependency
* [AAI-235] - remove the mysql-connector-java dependency
* [AAI-240] - Modify the properties of ESR rest API
* [AAI-243] - Define the REST API of EMS according to the new data model
* [AAI-250] - Define the Rest API of thirdparty sdnc according to the new data model
* [AAI-251] - Define the Rest API of VIM register according to the new data model
* [AAI-256] - Remove the database related code
* [AAI-261] - Add the API definition of A&AI to esr
* [AAI-262] - clean the esr-server parent pom
* [AAI-263] - Define the A&AI VIM register API in esr-server
* [AAI-269] - Simplify esr-server project level
* [AAI-275] - Add a switch for register to MSB by java-sdk
* [AAI-283] - Define the entities of external system.
* [AAI-285] - Realize the data transaction between ESR rest and A&AI API of VIM
* [AAI-286] - Realize the data transaction between ESR rest and A&AI API of VNFM
* [AAI-287] - Realize the data transaction between ESR rest and A&AI API of EMS
* [AAI-288] - Adjust the entity used in esr-server API
* [AAI-289] - There is some issue about external system schema
* [AAI-291] - Add tomcat as dependency of esr-gui
* [AAI-294] - Realize the data transaction between ESR rest and A&AI API of VNFM
* [AAI-299] - Fix the esr-server register to MSB issue
* [AAI-300] - Realize the function of register VIM and query VIM detail
* [AAI-301] - Realize the function of query VIM information list
* [AAI-302] - Realize update registered VIM
* [AAI-310] - Realize VNFM register API
* [AAI-311] - Realize the VNFM detail query API
* [AAI-312] - Realize the VNFM list query API
* [AAI-313] - Realize the VNFM delete API
* [AAI-314] - Realize the update VNFM API
* [AAI-315] - Realize register thirdparty sdnc API
* [AAI-316] - Realize query thirdparty SDNC detail API
* [AAI-317] - Realize query thirdparty SDNC list API
* [AAI-318] - Realize update thirdparty SDNC API
* [AAI-319] - Realize delete thirdparty SDNC API
* [AAI-320] - Realize EMS register API
* [AAI-321] - Realize query EMS details API
* [AAI-322] - Realize query all EMS details API
* [AAI-323] - Realize update EMS API
* [AAI-324] - Realize delete EMS API
* [AAI-332] - Fix the data structure of vim register data in esr-server
* [AAI-333] - Fix the issue "Can not add esr portal file to tomcat"
* [AAI-334] - Add VIM status to VIM management
* [AAI-335] - Add a testcase to test whether the service is reachable.
* [AAI-336] - Add the setup service CSIT test case
* [AAI-337] - Add jjb to add the esr-server CSIT task
* [AAI-340] - Add unit test function for ExtsysApp class
* [AAI-341] - Add unit test for cloudRegion bean class
* [AAI-343] - Add unit test for ems bean class
* [AAI-344] - Add unit test for esr system info bean
* [AAI-346] - Call the VIM API from esr-server
* [AAI-347] - Integrate esr-gui with server end for EMS
* [AAI-348] - Integrate esr-gui with server end for VNFM
* [AAI-349] - Integrate esr-gui with server end for thirdparty SDNC
* [AAI-350] - Add unit test for thirdparty sdnc bean
* [AAI-351] - Add unit test for vnfm bean class
* [AAI-352] - Add unit test for vnfm register info
* [AAI-353] - Add unit test for ems register info
* [AAI-354] - Add unit test for vim register info
* [AAI-355] - Add unit test for thirdparty sdnc register info
* [AAI-358] - Change util method from static to unstatic
* [AAI-359] - Fix the return data of del and query list API
* [AAI-360] - Realize delete vim API
* [AAI-361] - Update VIM after register finished.
* [AAI-362] - Clean the Config files
* [AAI-363] - Add unit test for app configuration
* [AAI-365] - change the objectToString method to un-static
* [AAI-366] - Add unit test for ExtsysUtil
* [AAI-367] - Add unit test case for EmsManagerUtil
* [AAI-368] - Add unit test case for SDNC register util
* [AAI-369] - Fix the VNFM register issue
* [AAI-370] - Change the static method in VIM to un-static
* [AAI-371] - Change the exception deal way for VIM register
* [AAI-375] - Add unit test case for VIM register utils
* [AAI-376] - Add unit test for vnfm register utils
* [AAI-379] - Add the document files for esr-server
* [AAI-385] - Add document files for esr-gui
* [AAI-391] - The esr related file should be packed in one category.
* [AAI-392] - Fix the parameter name of external system register in portal
* [AAI-399] - Add csit usecase for external system vnfm
* [AAI-402] - Remove the unused thirdparty code
* [AAI-404] - add csit uscase for thirdparty sdnc operation
* [AAI-405] - Add csit usecase for external system ems
* [AAI-406] - add csit usecase for external system (VIM)
* [AAI-421] - Add esr vm init script in demo project
* [AAI-429] - Increase Junit coverage
* [AAI-430] - Add swagger.json to main/resources