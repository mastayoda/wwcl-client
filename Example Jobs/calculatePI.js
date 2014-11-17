/* We get the parameters from the params variable */
var iterations = params.iterations;

/* The body of our kernel function */
var Pi=0;
var n=1;
for (i=0;i<=iterations;i++)
{
  Pi=Pi+(4/n)-(4/(n+2));
  n=n+4;
}

/* The result variable must be set */
result = Pi;

{
  "iterations":9999999
}