---
title: api
date: 2020-05-29
sidebar: 'auto'
keys:
 - 'e10adc3949ba59abbe56e057f20f883e'
---

一、调用步骤：

## 1、引入

import { FormCreate, getFormCreate } from '@/components';

components: {

FormCreate,

},

FormCreate是组件，getFormCreate是获取表单数据统一封装方法，2者一起引入

## 2、创建数据源，数据源类型是对象数组，每一个对象生成一个表单元素

formItem: [{

            name: 'input',
    
            key: 'name',
    
            value: '',
    
            label: '姓名',
    
            class: 'f-half',
    
            required: true,
    
          }, {
    
            name: 'select',
    
            key: 'gender',
    
            option: [
    
              { value: '0', label: '女' },
    
              { value: '1', label: '男' },
    
            ],
    
            value: '',
    
            label: '性别',
    
            class: 'f-half',
    
            required: true,
    
          }, {
    
            name: 'input',
    
            key: 'age',
    
            value: '',
    
            type: 'number',
    
            label: '年龄',
    
            class: 'f-half',
    
            required: true,
    
          }, {
    
            name: 'input',
    
            key: 'kebie',
    
            value: '',
    
            label: '科别',
    
            class: 'f-half',
    
          },
    
        ],

 


渲染数据源

<!-- <form-create v-for="item in formItem" :key="item.key" :item="item" corner/> -->

注意：需要给form-create的父标签增加f-item-area的类，避免样式问题，比如：

<!-- <template> -->

  <!-- <div class="f-item-area"> -->

    <!-- <form-create v-for="item in formItem" :key="item.key" :item="item" corner/> -->

  <!-- </div> -->

<!-- </template> -->

 

根据数据源生成以下表单