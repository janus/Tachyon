function test(v0, v3, v4, v5)
{
    //
    // Assignment in an expression statement
    //

    var a1 = 0;
    if (a1 !== 0)
        return 1;
    a1 = 5;
    if (a1 !== 5)
        return 2;

    //
    // Re-assignment in a var statement
    //

    var a2 = 0;
    if (a1 !== 5)
        return 3;
    var a2 = 6;
    if (a2 !== 6)
        return 4;

    //
    // Assignment inside if test
    //

    var a3 = 0;

    if (a3 = v4)
    {
        if (a3 !== v4)
            return 5;
    }
    else
    {
        return 6;
    }

    if (a3 !== v4)
        return 7;

    //
    // Assignment inside for test
    //

    var a4 = 0;

    for (var i = 0; a4 = v5; ++i)
    {
        if (a4 !== 5)
            return 8;

        if (i >= 5)
            break;
    }

    if (a4 !== 5)
        return 9;

    //
    // Assignment inside while test
    //

    var a5 = 0;

    while (a5 = v5)
    {
        if (a5 !== 5)
            return 10;

        break;
    }

    if (a5 !== 5)
        return 11;

    //
    // Assignment inside do-while test
    //

    var a6 = 0;
    var i = 0;

    do
    {
        if (i > 0)
            break;

        ++i;

    } while (a6 = 7);

    if (a6 !== 7)
        return 12;

    //
    // Assignment inside switch test
    //

    var a7 = v0;

    switch (a7 = v5)
    {
        case 5:
        if (a7 !== v5)
            return 13;
        break;

        default:
        return 14;
    }

    if (a7 !== v5)
        return 15;

    //
    // Assignment in arithmetic expression
    //

    var a8 = 0;
    var i = 0;
    
    (a8 = 3) + i;

    if (a8 !== 3)
        return 16;

    //
    // Assignment in comparison expression
    //

    var a9 = 0;
    var i = 0;
    
    (a9 = 3) > i;

    if (a9 !== 3)
        return 17;

    //
    // Assignment in conditional expression
    //

    var a10 = 0;
    var a11 = 0;
    
    (a10 = v3)? (a11 = v4):1;

    if (a10 !== v3)
        return 18;

    if (a11 !== v4)
        return 19;

    //
    // Assignment in logical disjunction
    //

    var a12 = v5;
    var a13 = v5;
    
    (a12 = v0) || (a13 = v4);

    if (a12 !== v0)
        return 20;

    if (a13 !== v4)
        return 21;

    var a12 = v4;
    var a13 = v4;
    
    (a12 = v3) || (a13 = v3);

    if (a12 !== v3)
        return 22;

    if (a13 !== v4)
        return 23;

    //
    // Assignment in logical conjunction
    //

    var a14 = v0;
    var a15 = v0;
    
    (a14 = v3) && (a15 = v4);

    if (a14 !== v3)
        return 24;

    if (a15 !== v4)
        return 25;

    var a14 = v5;
    var a15 = v5;
    
    (a14 = v0) && (a15 = v4);

    if (a14 !== v0)
        return 26;

    if (a15 !== v5)
        return 27;

    return 0;
}

function proxy()
{
    return test(0, 3, 4, 5);
}

