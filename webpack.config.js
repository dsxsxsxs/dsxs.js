var path=require('path');
module.exports = {
    entry: path.resolve(__dirname, "src/js"),
    output: {
        path: path.resolve(__dirname, "build/js"),
        filename: "output.js"
    },
    resolve: {
        modules: [
          path.resolve(__dirname, 'src/js/modules'),
      ],
        extensions:[
            '.js'
        ]
    }
};
