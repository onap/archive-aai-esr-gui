.. This work is licensed under a Creative Commons Attribution 4.0 International License.
.. http://creativecommons.org/licenses/by/4.0

Consumed APIs
-------------

In the Amsterdam release, Holmes does not consume any APIs provided by other ONAP components.

ESR-SERVER
^^^^^^^^^^

ESR-gui manage the external system (VIM/VNFM/EMS/thirdparty SDNC) with ers-server API.

#. VIM management API:

   ``POST /api/aai-esr-server/v1/vims``
   
   ``PUT /api/aai-esr-server/v1/vims/{cloudOwner}/{cloudRegionId}``
	
   ``GET /api/aai-esr-server/v1/vims/{cloudOwner}/{cloudRegionId}``
   
   ``GET /api/aai-esr-server/v1/vims``
   
   ``DELETE /api/aai-esr-server/v1/vims/{cloudOwner}/{cloudRegionId}``
   
#. VNFM management API:

   ``POST /api/aai-esr-server/v1/vnfms``
   
   ``PUT /api/aai-esr-server/v1/vnfms/{vnfmId}``
	
   ``GET /api/aai-esr-server/v1/vnfms/{vnfmId}``
   
   ``GET /api/aai-esr-server/v1/vnfms``
   
   ``DELETE /api/aai-esr-server/v1/vnfms/{vnfmId}``
   
#. EMS management API:

   ``POST /api/aai-esr-server/v1/emses``
   
   ``PUT /api/aai-esr-server/v1/emses/{emsId}``
	
   ``GET /api/aai-esr-server/v1/emses/{emsId}``
   
   ``GET /api/aai-esr-server/v1/emses``
   
   ``DELETE /api/aai-esr-server/v1/emses/{emsId}``
   
#. Thirdparty SDNC management API:

   ``POST /api/aai-esr-server/v1/sdncontrollers``
   
   ``PUT /api/aai-esr-server/v1/sdncontrollers/{sdnControllerId}``
	
   ``GET /api/aai-esr-server/v1/sdncontrollers/{sdnControllerId}``
   
   ``GET /api/aai-esr-server/v1/sdncontrollers``
   
   ``DELETE /api/aai-esr-server/v1/sdncontrollers/{sdnControllerId}``

More details could be found at `A&AI APIs <https://wiki.onap.org/pages/viewpage.action?pageId=11930343>`_. 
   