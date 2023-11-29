    exports.conf = {
        "tasks": {
            "dump": function (util, doc) {
                console.log(doc._id);
            }
        }
    };
