/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


module.exports = function()
{
    // start
    this.__construct.apply(this, arguments);
};

module.exports.prototype = {

    // utils
    __EventDispatcher_aInputs: [],



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function ()
    {
        console.log('EventDispatcher - constructor');
    },



    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Add event listener
     * @param sEvent
     * @param fMethod
     */
    addEventListener: function(sEvent, fMethod)
    {
        // 1. verify or init
        if (!this.__EventDispatcher_aInputs[sEvent]) this.__EventDispatcher_aInputs[sEvent] = [];

        // 2. store
        this.__EventDispatcher_aInputs[sEvent].push(fMethod);
    },

    /**
     * dispatch event
     * @param sEvent
     */
    dispatchEvent: function(sEvent)
    {
        // 1. validate
        if (this.__EventDispatcher_aInputs[sEvent])
        {
            // a. find
            let nMethodCount = this.__EventDispatcher_aInputs[sEvent].length;
            for (let nIndex = 0; nIndex < nMethodCount; nIndex++)
            {
                // I. register
                let fMethod = this.__EventDispatcher_aInputs[sEvent][nIndex];

                // II. execute
                fMethod.apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
    }

};
