export default ({ body, title, initialState }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <meta name="full-screen" content="yes" />
        <meta name="browsermode" content="application" />
        <meta name="x5-orientation" content="portrait" />
        <meta name="x5-fullscreen" content="true" />
        <meta name="x5-page-mode" content="app" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0,minimal-ui" />
        <script>window.__APP_INITIAL_STATE__ = ${initialState}</script>
        <script type="text/javascript">
                // 性能对象
                window.$performance = {
                    // 各个时间关键点
                    timing: {
                        // 时间统计起点
                        start: +new Date()
                    }
                };
        </script>
      </head>
      <body>
        <div>${body}</div>
      </body>
    </html>
  `;
};