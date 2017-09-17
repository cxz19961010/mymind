function vec_mul(n,R,point) //R为变换矩阵
{
    var new_point=new Array();
    var i,j;
    for(i=0;i<n;i++)
    {
        var sum=0;
        for(j=0;j<n;j++)
            sum+=R[i][j]*point[j];
        new_point[i]=sum;
    }
    return new_point;
}

function map(perspective,point) //三维坐标映射到二维,视点距离为perspective，投射平面为x-y平面,new_point 只有x\y坐标，new_point[2]记录缩放比例
{
    var new_point=new Array();
    new_point[0]=point[0]*perspective/(point[2]+perspective);
    new_point[1]=point[1]*perspective/(point[2]+perspective);
    new_point[2]=perspective/(point[2]+perspective);
    return new_point;
}

    



function rotate(point,vector,angle) //按照某个向量旋转某个角度
{
    var new_point=new Array();
    rad=angle/180*Math.PI; //角度转换为弧度
    var R=new Array();
    R[0]=new Array();
    R[1]=new Array();
    R[2]=new Array();

    v_len=Math.sqrt(vector[0]*vector[0]+vector[1]*vector[1]+vector[2]*vector[2])


    
    var v_x=vector[0]*Math.sin(rad/2)/v_len,v_y=vector[1]*Math.sin(rad/2)/v_len,v_z=vector[2]*Math.sin(rad/2)/v_len,v_w=Math.cos(rad/2);

    R[0][0]=1-2*(v_y*v_y+v_z*v_z);
    R[0][1]=2*(v_x*v_y-v_z*v_w);
    R[0][2]=2*(v_x*v_z+v_y*v_w);
    R[1][0]=2*(v_x*v_y+v_z*v_w);
    R[1][1]=1-2*(v_x*v_x+v_z*v_z);
    R[1][2]=2*(v_y*v_z-v_x*v_w);
    R[2][0]=2*(v_x*v_z-v_y*v_w);
    R[2][1]=2*(v_y*v_z+v_x*v_w);
    R[2][2]=1-2*(v_x*v_x+v_y*v_y);

    new_point=vec_mul(3,R,point);
    return new_point;
}

function polar_to_rectangular(polar)//极坐标转换为直角坐标
{
    var rectangular=new Array();
    var r=polar[0],a=polar[1],b=polar[2];
    rectangular[0]=r*Math.sin(a)*Math.cos(b);//x
    rectangular[1]=r*Math.sin(a)*Math.sin(b);//y
    rectangular[2]=r*Math.cos(a);//z
    return rectangular;
}


function scatter_point(n,r) //将n个点尽量分布于球面上，返回分布的坐标,r为半径
{
    var points=new Array();
    var k,max_k=200;//分布在几个圆面上
    var min_space_diff=1000000,k_min_space,min_space;//k_min_space 记录分成几个圆，min_space 记录点之间的距离
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
        if(len+min_space>perimeter_next)
        {
            c++;
            perimeter=perimeter_next;
            perimeter_next+=2*Math.PI*Math.sin(rad*c);
        }
        var a=c*rad,b=(len-perimeter)/(Math.sin(rad*c));
        points[i]=new Array();  
        polar=new Array(r,a,b);
        points[i]=polar_to_rectangular(polar);
    }
    return points;
}
        
function rotate_map(perspective,point,vector,angle,p_left,p_top)//将某个点旋转后映射到二维平面上,返回[x,y,缩放比例],perspective是视点到平面距离,p_left\p_top是坐标中心对应平面中的坐标
{
    p_left=p_left?p_left:0;
    p_top=p_top?p_top:0;
    var new_point=rotate(point,vector,angle);
    var new_point_2d=map(perspective,new_point);
    new_point_2d[0]+=p_left;
    new_point_2d[1]+=p_top;
    var info={'3d':new_point,'2d':new_point_2d};
    return info;
}
        




        




