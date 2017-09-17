"use strict"
var link=
    {       //连线对象圆形
        node1:undefined, //连接的两个节点对象
        node2:undefined,
        main_element:undefined, 
        element:undefined,

        width:0,

        main_element_iu:function(father_dom)//自动根据提供的节点的信息创建子节点，并使其保持在父节点的中心位置 或更新子节点的位置
        {
            if(this.main_element==undefined)
            {
                this.main_element=document.createElement('div');
                father_dom.appendChild(this.main_element); 

                var w=father_dom.clientWidth;
                var h=father_dom.clientHeight;

                this.main_element.style.position='absolute';
            }
            this.main_element.style.left=parseInt(w/2)+'px';
            this.main_element.style.top=parseInt(h/2)+'px';
            return this.main_element;
        },

        element_iu:function()//创建关系节点div或者更新其位置信息
        {
            if(this.element==undefined)
            {
                this.element=document.createElement('div');
                this.main_element.appendChild(this.element); 
                this.element.style.position="absolute";
            };
            var n1_x=this.node1.coordinate_2d.x;
            var n1_y=this.node1.coordinate_2d.y;
            var n2_x=this.node2.coordinate_2d.x;
            var n2_y=this.node2.coordinate_2d.y;
            var width=(Math.sqrt((n1_x-n2_x)*(n1_x-n2_x)+(n1_y-n2_y)*(n1_y-n2_y)));

            var angle=0;
            if(width>0)
            {
                angle=(Math.acos((n2_x-n1_x)/width))/Math.PI*180;
                if(n2_y>n1_y)
                    angle=-angle;
            }



            this.element.style.width=parseInt(width);
            this.element.style.transformOrigin="0% 0%";
            this.element.style.transform="translate3d("+n1_x+"px,"+n1_y+"px,0px) rotate("+(-angle)+"deg)";//用3d旋转抗锯齿，否则会很难看

            this.element.style.zIndex=parseInt((this.node1.coordinate_2d.zIndex+this.node2.coordinate_2d.zIndex)/2); //设置叠放次序，求平均
            this.element.style.opacity=((this.node1.coordinate_2d.opacity+this.node2.coordinate_2d.opacity)/2); //设置透明度

            return this.element;

        },


    };

function Link(node1,node2) //构造函数
{
    this.node1=node1;
    this.node2=node2;
    this.element_iu();
}
Link.prototype=link;


var node=  //节点对象原型
    {
        main_element:undefined,
        element:undefined,
        perspective:1000 ,//视点距离
        coordinate:{x:0,y:0,z:0},//记录节点初始坐标
        matrix:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],   //初始坐标变换矩阵

        coordinate_2d:{x:0,y:0,z:0,scale:1,zIndex:0,opacity:0,}, //记录转换过后的2d坐标

        matrix_mul:function(m1,m2)//计算矩阵
        {
            var i=m1.length;
            var j=m2.length;
            var k=m2[0].length;
            var new_m=new Array();
            for( var i0=0;i0<i;i0++)
            {
                new_m[i0]=new Array();
                for(var k0=0;k0<k;k0++)
                {
                    var sum=0;
                    for( var j0=0;j0<j;j0++)
                    {
                        sum+=m1[i0][j0]*m2[j0][k0];
                    }
                    new_m[i0][k0]=sum;
                }
            }
            return new_m;
        },

        rotate:function(vector,point,angle) //以某个点为中心，以某个向量为轴旋转某个角度,更新变换矩阵
        {
            var rad=angle/180*Math.PI; //角度转换为弧度
            var p_x=point[0],p_y=point[1],p_z=point[2];
            var v_len=Math.sqrt(vector[0]*vector[0]+vector[1]*vector[1]+vector[2]*vector[2])
            var v_x=vector[0]*Math.sin(rad/2)/v_len,v_y=vector[1]*Math.sin(rad/2)/v_len,v_z=vector[2]*Math.sin(rad/2)/v_len,v_w=Math.cos(rad/2);

            var a0=2*(v_y*v_y+v_z*v_z);
            var a1=2*(v_x*v_y-v_z*v_w);
            var a2=2*(v_x*v_z+v_y*v_w);
            var a3=2*(v_x*v_y+v_z*v_w);
            var a4=2*(v_x*v_x+v_z*v_z);
            var a5=2*(v_y*v_z-v_x*v_w);
            var a6=2*(v_x*v_z-v_y*v_w);
            var a7=2*(v_y*v_z+v_x*v_w);
            var a8=2*(v_x*v_x+v_y*v_y);

            var R=[
                [ 1-a0,a1,a2,p_x*a0-p_y*a1-p_z*a2],
                [ a3,1-a4,a5,-p_x*a3+p_y*a4-p_z*a5],
                [ a6,a7,1-a8,-p_x*a6-p_y*a7+p_z*a8],
                [0,0,0,1]
            ]

            var new_matrix=new Array(4); //计算新的变换矩阵
            this.matrix=this.matrix_mul(R,this.matrix);
        },
        get map()//返回投影到平面后的坐标和缩放[x,y,z,scala]
        {
            var r=new Array();
            var coordinate1=new Array([this.coordinate[0]],[this.coordinate[1]],[this.coordinate[2]],[1]);
            var coordinate2=this.matrix_mul(this.matrix,coordinate1);
            var new_coordinate=[coordinate2[0][0],coordinate2[1][0],coordinate2[2][0],coordinate2[3][0],];

            r[0]=new_coordinate[0]*this.perspective/(-new_coordinate[2]+this.perspective);
            r[1]=new_coordinate[1]*this.perspective/(-new_coordinate[2]+this.perspective);
            r[2]=new_coordinate[2];
            r[3]=this.perspective/(-new_coordinate[2]+this.perspective);
            return r;
        },
        main_element_iu:function(father_dom)//自动根据提供的节点的信息创建子节点，并使其保持在父节点的中心位置 或更新子节点的位置
        {
            if(this.main_element==undefined)
            {
                this.main_element=document.createElement('div');
                father_dom.appendChild(this.main_element); 

                var w=father_dom.clientWidth;
                var h=father_dom.clientHeight;

                this.main_element.style.position='absolute';
            }
            this.main_element.style.left=parseInt(w/2)+'px';
            this.main_element.style.top=parseInt(h/2)+'px';
            return this.main_element;
        },
        element_iu:function()//创建元素节点div或者更新其位置信息
        {
            if(this.element==undefined)
            {
                this.element=document.createElement('div');
                this.main_element.appendChild(this.element); 
                this.element.style.position="absolute";
            }
            var r=this.map;

            this.coordinate_2d.x=r[0];
            this.coordinate_2d.y=r[1];
            this.coordinate_2d.z=r[2];
            this.coordinate_2d.scale=r[3];

            this.coordinate_2d.zIndex=parseInt(r[2]*10+3000); //叠放次序计和透明度算方式暂定为此
            this.coordinate_2d.opacity=(r[2]+600)/800; 

            this.element.style.transform='translate('+r[0]+'px,'+r[1]+'px) scale('+r[3]+','+r[3]+')';
            this.element.style.zIndex=this.coordinate_2d.zIndex; //设置叠放次序
            this.element.style.opacity=this.coordinate_2d.opacity; //设置透明度
            return this.element;

        },
    }

function Node(coordinate) //构造函数
{
    this.coordinate=coordinate;
    this.coordinate_2d={x:0,y:0,z:0,scale:1,zIndex:0,opacity:1};
    this.element_iu();//创建节点元素
}
Node.prototype=node;

function polar_to_rectangular(polar)//极坐标转换为直角坐标
{
    var rectangular=new Array();
    var r=polar[0],a=polar[1],b=polar[2];
    rectangular[0]=r*Math.sin(a)*Math.cos(b);//x
    rectangular[1]=r*Math.sin(a)*Math.sin(b);//y
    rectangular[2]=r*Math.cos(a);//z
    return rectangular;
}

function scatter_nodes(n,r)//在半径为r的球面上创建n个node元素,返回数组
{

    var nodes=new Array();
    var k,max_k=50;//分布在几个圆面上
    var min_space_diff=10000000,k_min_space,min_space;//k_min_space 记录分成几个圆，min_space 记录点之间的距离
    for(k=1;k<=max_k;k++)
    {
        var rad=Math.PI/(k+1),perimeter=0; 
        for(var j=1;j<=k;j++)
        {
            perimeter+=2*Math.PI*Math.sin(rad*j);
        }
        var s=perimeter/(n+1);
        var space_diff=Math.abs(s-rad); //计算圆之间的距离和圆上两点距离的差值，取最小值
        if(space_diff<min_space_diff)
        {
            min_space_diff=space_diff;
            k_min_space=k;
            min_space=s;
        }
    }

    var rad=Math.PI/(k_min_space+1); 
    var perimeter=0,c=1,perimeter_next=2*Math.PI*Math.sin(rad*c);
    for(var i=0;i<n;i++)
    {
        var len=i*min_space;
        if(len+min_space*0.8>perimeter_next)
        {
            c++;
            perimeter=perimeter_next;
            perimeter_next+=2*Math.PI*Math.sin(rad*c);
        }
        var a=c*rad,b=(len-perimeter)/(Math.sin(rad*c));
        nodes[i]=new Node(polar_to_rectangular([r,a,b]));
    }
    return nodes;
}


var mouse_rotate_init=function(father_dom,nodes)
    {
        var velocity=0;//记录鼠标运动速度
        var acceleration0=0.4;//记录减速加速度参数0
        var acceleration1=0.001;//记录减速加速度参数1
        var isdown=0;
        var mX=0,mY=0; //记录更新的鼠标坐标
        var lastX=0,lastY=0;//记录上次鼠标位置坐标
        var vector=[0,0,0]; //记录旋转的向量
        var point=[0,0,0]; //记录旋转的中心
        var K=2000;//旋转的比例系数

        var delT=15; //刷新速度
        var delTl=80; //因为刷新速度太快，所以不能在刷新的同时统计速度等信息
        var vectorls=new Array(),velocityls=new Array();//在delTl的间隔内统计的量;
        var timer;
        
        function mouse_distance() //计算移动的长度
        {
            var delX=mX-lastX; 
            var delY=mY-lastY;
            var delL=Math.sqrt(delX*delX+delY*delY);
            lastX=mX;
            lastY=mY;
            vector=[-delY,delX,0];
            return delL;
        };



        var decelerate=function()//鼠标松开后不立刻停止
        {
             
            if(velocity<=0 || isdown !=0)return ;
            var delL=velocity*delT;
            node.rotate(vector,point,delL/K*360);

            //更新nodes位置
            for(var i=0;i<nodes.length;i++)
            {
                nodes[i].element_iu();
            }
            //更新links的位置
            for(var i=0;i<links.length;i++)
            {
                links[i].element_iu();
            }

            velocity=velocity-(velocity+acceleration0)*acceleration1*delT;
            if( velocity >0 )
                setTimeout(decelerate,delT);
        };

        function mouse_up(event)
        {
            isdown=0;
            clearInterval(timer);
            setTimeout(decelerate,delT);

            var v_sum=0; //将速度替换为一段时间内平均速度
            for(var i=0;i<velocityls.length;i++)
                v_sum+=velocityls[i];
            velocity=v_sum/velocityls.length;

            var vector_sum=[0,0,0]  //将向量替换为一段时间平均向量
            for(var i=0;i<vectorls.length;i++)
            {
                vector_sum[0]+=vectorls[i][0];
                vector_sum[1]+=vectorls[i][1];
                vector_sum[2]+=vectorls[i][2];
            }
            vector=[
                vector_sum[0]/vectorls.length,
                vector_sum[1]/vectorls.length,
                vector_sum[2]/vectorls.length,
            ]
              
        };

        function mouse_move()
        {
            var delL=mouse_distance();
            velocity=delL/delT;

            vectorls.unshift([vector[0],vector[1],vector[2]]);
            vectorls.length=parseInt(delTl/delT);

            velocityls.unshift(velocity);
            velocityls.length=parseInt(delTl/delT);


            if(velocity<=0)return 0;//防止出现delL=0的情况
            node.rotate(vector,point,delL/K*360);
            
            //更新nodes的位置
            for(var i=0;i<nodes.length;i++)
            {
                nodes[i].element_iu();
            }
            //更新links的位置
            for(var i=0;i<links.length;i++)
            {
                links[i].element_iu();
            }
        };

       function mouse_down(event)
        {
           if(isdown==1)return;
           isdown=1;
           mouse_distance(event);//只是更新坐标
           timer=setInterval(mouse_move,delT);
        };

        function mouse_position_update(event)
        {
            mX=event.clientX;
            mY=event.clientY;
        }

        father_dom.onmousedown=mouse_down;
        document.onmousemove=mouse_position_update;
        document.onmouseup=mouse_up;
    };
