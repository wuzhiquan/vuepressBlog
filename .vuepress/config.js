module.exports = {
  "title": "Quan的博客",
  "description": "分享学习技术知识",
  "dest": "public",
  "head": [
    [
      "link",
      {
        "rel": "icon",
        "href": "/favicon.ico"
      }
    ],
    [
      "meta",
      {
        "name": "viewport",
        "content": "width=device-width,initial-scale=1,user-scalable=no"
      }
    ]
  ],
  "theme": "reco",
  "locales": {
    '/': {
      "lang": 'zh-CN'
    }
  },
  "themeConfig": {
    "nav": [
      {
        "text": "首页",
        "link": "/",
        "icon": "reco-home"
      },
      {
        "text": "时间轴",
        "link": "/timeline/",
        "icon": "reco-date"
      },
      {
        "text": "我的收藏",
        "icon": "reco-message",
        "link": "/mine/collect/"
        // "items": [
        //   {
        //     "text": "vuepress-reco",
        //     "link": "/mine/collect/"
        //   }
        // ]
      },
      {
        "text": "GitHub",
        "link": "https://github.com/wuzhiquan",
        "icon": "reco-github"
      }
    ],
    "sidebar": {
      "/blogs/Vue/": [
        "",
        "1",
        "2",
      ],
      "/blogs/TypeScript/": [
        "",
      ],
      "/blogs/ES6+/": [
        "",
      ],
      "/blogs/前端工程化/": [
        "",
        "1",
      ],
      "/blogs/面试相关/": [
        "",
        "1",
        "2",
      ],
      "/blogs/常用工具/": [
        "",
      ],
      "/mine/collect/": [
        "",
        "theme",
        "plugin",
        "api"
      ]
    },
    "subSidebar": "auto",
    "type": "blog",
    "blogConfig": {
      "category": {
        "location": 2,
        "text": "Category"
      },
      "tag": {
        "location": 3,
        "text": "Tag"
      }
    },
    // "friendLink": [
    //   {
    //     "title": "午后南杂",
    //     "desc": "Enjoy when you can, and endure when you must.",
    //     "email": "1156743527@qq.com",
    //     "link": "https://www.recoluan.com"
    //   },
    //   {
    //     "title": "vuepress-theme-reco",
    //     "desc": "A simple and beautiful vuepress Blog & Doc theme.",
    //     "avatar": "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
    //     "link": "https://vuepress-theme-reco.recoluan.com"
    //   }
    // ],
    // "logo": "/logo.png",
    "search": true,
    "searchMaxSuggestions": 10,
    "lastUpdated": "Last Updated",
    "author": "Quan",
    "authorAvatar": "/logo.png",
    "record": "粤ICP备18059339号",
    "recordLink": "https://beian.miit.gov.cn/",
    // "startYear": "2017"
  },
  "markdown": {
    "lineNumbers": true
  },
  plugins: [
    // 更新刷新插件
    ['@vuepress/pwa', {
      serviceWorker: true,
      updatePopup: {
        message: "发现新内容可用",
        buttonText: "刷新"
      }
    }],
    // 代码复制弹窗插件
    ["vuepress-plugin-nuggets-style-copy", {
      copyText: "copy",
      tip: {
          content: "复制成功!"
      }
    }],
    ['@vuepress-reco/vuepress-plugin-pagation', {}],
    ['@vuepress-reco/vuepress-plugin-comments', {
      solution: 'valine',
      options: {
        appId: '0RTn4qGAmFlOkqCisEr842wn-gzGzoHsz',// your appId
        appKey: 'UP22iQv27sLQuF4qa4V68K38', // your appKey
      }
    }],
  ]
}