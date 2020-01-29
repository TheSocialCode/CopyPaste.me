/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


module.exports = function(classPrototypeToExtend)
{
    // start
    this.__construct(classPrototypeToExtend);
};

module.exports.prototype = {


    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (classPrototypeToExtend)
    {
        // data
        classPrototypeToExtend.__EventDispatcherExtender_aInputs = [];

        /**
         * Add event listener
         * @param sEvent
         * @param fMethod
         */
        classPrototypeToExtend.addEventListener = function(sEvent, fMethod)
        {
            // 1. verify or init
            if (!this.__EventDispatcherExtender_aInputs[sEvent]) this.__EventDispatcherExtender_aInputs[sEvent] = [];

            // 2. store
            this.__EventDispatcherExtender_aInputs[sEvent].push(fMethod);
        };

        /**
         * dispatch event
         * @param sEvent
         */
        classPrototypeToExtend.dispatchEvent = function(sEvent)
        {
            // 1. validate
            if (this.__EventDispatcherExtender_aInputs[sEvent])
            {
                // a. find
                let nMethodCount = this.__EventDispatcherExtender_aInputs[sEvent].length;
                for (let nIndex = 0; nIndex < nMethodCount; nIndex++)
                {
                    // I. register
                    let fMethod = this.__EventDispatcherExtender_aInputs[sEvent][nIndex];

                    // II. execute
                    fMethod.apply(this, Array.prototype.slice.call(arguments, 1));
                }
            }
        };
    }

};
