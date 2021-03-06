/* _________________________________________________________________________
 *
 *             Tachyon : A Self-Hosted JavaScript Virtual Machine
 *
 *
 *  This file is part of the Tachyon JavaScript project. Tachyon is
 *  distributed at:
 *  http://github.com/Tachyon-Team/Tachyon
 *
 *
 *  Copyright (c) 2011, Universite de Montreal
 *  All rights reserved.
 *
 *  This software is licensed under the following license (Modified BSD
 *  License):
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are
 *  met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the name of the Universite de Montreal nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 *  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *  TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 *  PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL UNIVERSITE DE
 *  MONTREAL BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * _________________________________________________________________________
 */

/**
@fileOverview
Utility code for running and testing programs as unit tests.

@author
Maxime Chevalier-Boisvert
*/

/**
Compile and run a source file, returning the result.
*/
function compileAndRunSrcs(srcFiles, funcName, inputArgs, compParams)
{
    var argTypes = [];

    // If input arguments are specified
    if (inputArgs !== undefined)
    {
        for (var i = 0; i < inputArgs.length; ++i)
        {
            var arg = inputArgs[i];

            if (isInt(arg))
            {
                argTypes.push(new CIntAsBox());
            }           

            else if (typeof arg === 'string')
            {
                print('Adding string arg type');

                argTypes.push(new CStringAsBox());
            }
            else
            {
                error('unsupported argument type');
            }
        }
    }

    if (compParams === undefined)
        compParams = 'clientParams';

    var params = config[compParams];

    assert (
        params instanceof CompParams,
        'invalid compilation parameters'
    );

    // For each source file
    for (var i = 0; i < srcFiles.length; ++i)
    {
        var srcFile = srcFiles[i];

        // Compile the unit
        var ir = compileSrcFile(srcFile, params);

        // Create a bridge to execute this unit
        var unitBridge = makeBridge(
            ir,
            config.hostParams,
            [],
            new CIntAsBox()
        );

        // Execute the compilation unit to initialize it
        unitBridge(params.ctxPtr);

        // Try to find the function of the specified name in the unit
        var func = ir.getChild(funcName);

        if (func !== null)
            var funcIR = func;
    }

    // If a function to be called was specified
    if (funcName !== undefined)
    {
        assert (
            funcIR !== null,
            'test function not found'
        );

        var funcBridge = makeBridge(
            funcIR,
            config.hostParams,
            argTypes,
            new CIntAsBox()
        );

        //print('compileAndRunSrcs, calling w/ args: ' + inputArgs);

        // Call the function with the given arguments
        var result = funcBridge.apply(undefined, [params.ctxPtr].concat(inputArgs));
    }

    return result;
}

/**
Generate a unit test from source files, testing the return value
obtained after compilation and execution.
*/
function genProgTest(srcFiles, funcName, inputArgs, expectResult, compParams)
{
    if (typeof srcFiles === 'string')
        srcFiles = [srcFiles];

    return function()
    {
        var result = compileAndRunSrcs(
            srcFiles, 
            funcName,
            inputArgs,
            compParams
        );

        assert (
            (inputArgs === undefined && expectResult === undefined) ||
            result === expectResult,
            'Invalid return value "' + result + 
            '", expected "' + expectResult + '"'
        );
    };
}

/**
Test suite for test programs.
*/
tests.programs = tests.testSuite();

/**
Runtime initialization
*/
tests.programs.initPrimitives = function ()
{
    // Reset the Tachyon configuration
    initConfig(PLATFORM_64BIT, config.verbosity);

    // Initialize the Tachyon runtime
    initPrimitives(config.hostParams);

    reportPerformance();
};

/**
Value return test.
*/
tests.programs.basic_ret = genProgTest(
    'programs/basic_ret/basic_ret.js', 
    'f', 
    [20], 
    20
);

/**
If statement test.
*/
tests.programs.basic_if = genProgTest(
    'programs/basic_if/basic_if.js', 
    'f', 
    [],
    2
);

/**
Argument passing test.
*/
tests.programs.basic_many_args = genProgTest(
    'programs/basic_many_args/basic_many_args.js', 
    'f',
    [0,0,0,0,20],
    20
);

/**
Comparison operators test
*/
tests.programs.basic_cmp = genProgTest(
    'programs/basic_cmp/basic_cmp.js',
    'test',
    [5],
    0
);

/**
Global object access test
*/
tests.programs.global_obj = genProgTest(
    'programs/global_obj/global_obj.js',
    'test',
    [],
    0,
    'hostParams'
);

/**
Arithmetic operators test.
*/
tests.programs.basic_arith = genProgTest(
    'programs/basic_arith/basic_arith.js',
    'test',
    [],
    0
);

/**
Bitwise operators test.
*/
tests.programs.basic_bitops = genProgTest(
    'programs/basic_bitops/basic_bitops.js',
    'test',
    [],
    0
);

/**
Arithmetic shift test.
*/
tests.programs.basic_shift = genProgTest(
    'programs/basic_shift/basic_shift.js',
    'foo',
    [],
    0
);

/**
Test of limits of integer overflow handling.
*/
tests.programs.basic_ovf = genProgTest(
    'programs/basic_ovf/basic_ovf.js',
    'proxy',
    [],
    0,
    'hostParams'
);

/**
Test of basic optimization patterns.
*/
tests.programs.basic_opts = genProgTest(
    'programs/basic_opts/basic_opts.js',
    'proxy',
    [],
    0,
    'hostParams'
);

/**
Test of assignment expressions.
*/
tests.programs.basic_assign = genProgTest(
    'programs/basic_assign/basic_assign.js',
    'proxy',
    [],
    0,
    'clientParams'
);

/**
Test of boolean value evaluation.
*/
tests.programs.basic_bool_eval = genProgTest(
    'programs/basic_bool_eval/basic_bool_eval.js',
    'test',
    [],
    0
);

/**
Multiple files/units test
*/
tests.programs.multi_file = genProgTest(
    ['programs/multi_file/file1.js', 'programs/multi_file/file2.js'],
    'test',
    [],
    0
);

/**
Test of typed IIR variables.
*/
tests.programs.iir_vars = genProgTest(
    'programs/iir_vars/iir_vars.js',
    'test',
    [],
    0,
    'hostParams'
);

/**
Passing arguments and getting a return value from an FFI function
*/
tests.programs.ffi_sum = genProgTest(
    'programs/ffi_sum/ffi_sum.js',
    'f',
    [10,15],
    25,
    'hostParams'
);

/**
Time-related FFI functions
*/
tests.programs.ffi_time = genProgTest(
    'programs/ffi_time/ffi_time.js',
    'test',
    [],
    0,
    'hostParams'
);

/**
File I/O FFI functions
*/
tests.programs.ffi_fileio = genProgTest(
    'programs/ffi_fileio/ffi_fileio.js',
    'test',
    [],
    0,
    'hostParams'
);

/**
This test is meant to ensure that values are correctly merged after 
conditionals and that local variable values are properly preserved across
calls.
*/
tests.programs.cond_calls = genProgTest(
    'programs/cond_calls/cond_calls.js',
    'fee',
    [],
    20
);

/**
Test of multiple function calls with computations in between.
*/
tests.programs.two_calls = genProgTest(
    'programs/two_calls/two_calls.js',
    'foo',
    [],
    39
);

/**
Fibonacci implementation to test recursive calls.
*/
tests.programs.fib = genProgTest(
    'programs/fib/fib.js',
    'fib',
    [20],
    6765
);

/**
Test of a loop computing a sum.
*/
tests.programs.loop_sum = genProgTest(
    'programs/loop_sum/loop_sum.js',
    'loop_sum',
    [10],
    45
);

/**
Test of a function call followed by a loop.
*/
tests.programs.call_loop = genProgTest(
    'programs/call_loop/call_loop.js',
    'foo',
    [],
    15
);

/**
Test of function calls before, inside and after a loop.
*/
tests.programs.loop_calls = genProgTest(
    'programs/loop_calls/loop_calls.js',
    'foo',
    [1],
    14338
);

/**
Test of two loops, one after the other, each performing function calls.
*/
tests.programs.loop_loop = genProgTest(
    'programs/loop_loop/loop_loop.js',
    'foo',
    [5],
    60
);

/**
Test of a for loop inside a while loop.
*/
tests.programs.while_for = genProgTest(
    'programs/while_for/while_for.js',
    'foo',
    [5],
    225
);

/**
Loop with enough variables to force spilling of phi nodes.
*/
tests.programs.loop_spills = genProgTest(
    'programs/loop_spills/loop_spills.js',
    'foo',
    [42],
    122
);

/**
Nested loops unit test.
*/
tests.programs.nested_loops = genProgTest(
    'programs/nested_loops/nested_loops.js',
    'foo',
    [3],
    503
);

/**
Object property put/get unit test.
*/
tests.programs.obj_props = genProgTest(
    'programs/obj_props/obj_props.js',
    'foo',
    [33],
    1584
);

/**
Linked list unit test.
*/
tests.programs.linked_list = genProgTest(
    'programs/linked_list/linked_list.js',
    'linkedlist',
    [5],
    10
);

/**
String equality and non-equality.
*/
tests.programs.str_equality = genProgTest(
    'programs/str_equality/str_equality.js',
    'foo',
    [],
    0
);

/**
String concatenation with another string.
*/
tests.programs.str_cat_str = genProgTest(
    'programs/str_cat_str/str_cat_str.js',
    'foo',
    [],
    0
);

/**
String concatenation with integers.
*/
tests.programs.str_cat_int = genProgTest(
    'programs/str_cat_int/str_cat_int.js',
    'foo',
    [],
    0
);

/**
String conversion from/to integer
*/
tests.programs.str_int_conv = genProgTest(
    'programs/str_int_conv/str_int_conv.js',
    'test',
    [],
    0
);

/**
Comma operator test
*/
tests.programs.comma_op = genProgTest(
    'programs/comma_op/comma_op.js',
    'test',
    [],
    0
);

/**
Switch statement test
*/
tests.programs.switch = genProgTest(
    'programs/switch/switch.js',
    'test',
    [],
    0
);

/**
With statement test
*/
tests.programs.with = genProgTest(
    'programs/with/with.js',
    'test',
    [],
    0
);

/**
Exceptions test
*/
tests.programs.exceptions = genProgTest(
    'programs/exceptions/exceptions.js',
    'test',
    [],
    0
);

/**
Array indexing test.
*/
tests.programs.array_idx = genProgTest(
    'programs/array_idx/array_idx.js',
    'foo',
    [12],
    132
);

/**
Array length property test.
*/
tests.programs.array_length = genProgTest(
    'programs/array_length/array_length.js',
    'foo',
    [],
    0
);

/**
Array size extension test.
*/
tests.programs.array_ext = genProgTest(
    'programs/array_ext/array_ext.js',
    'test',
    [],
    0
);

/**
Property deletion on objects.
*/
tests.programs.obj_delete = genProgTest(
    'programs/obj_delete/obj_delete.js',
    'test',
    [],
    0
);

/**
Recursive n-queens solver. Uses arrays extensively.
*/
tests.programs.nqueens = genProgTest(
    'programs/nqueens/nqueens.js',
    'test',
    [],
    0
);

/**
Iterative mergesort test.
*/
tests.programs.merge_sort = genProgTest(
    'programs/merge_sort/merge_sort.js',
    'test',
    [],
    0,
    'hostParams'
);

/**
Closure variable initialization.
*/
tests.programs.clos_init = genProgTest(
    'programs/clos_init/clos_init.js',
    'test',
    [],
    0
);

/**
Closure variable capture.
*/
tests.programs.clos_capt = genProgTest(
    'programs/clos_capt/clos_capt.js',
    'foo',
    [5],
    8
);

/**
Closure variable access.
*/
tests.programs.clos_access = genProgTest(
    'programs/clos_access/clos_access.js',
    'test',
    [],
    0
);

/**
Calls across closure boundaries.
*/
tests.programs.clos_xcall = genProgTest(
    'programs/clos_xcall/clos_xcall.js',
    'test',
    [5],
    5
);

/**
Closure and global variable test.
*/
tests.programs.clos_globals = genProgTest(
    'programs/clos_globals/clos_globals.js',
    'test',
    [],
    0
);

/**
Closure capturing an argument and global variable access test.
*/
tests.programs.clos_arg = genProgTest(
    'programs/clos_arg/clos_arg.js',
    'test',
    [],
    0
);

/**
Constructor/new test.
*/
tests.programs.ctor_new = genProgTest(
    'programs/ctor_new/ctor_new.js',
    'foo',
    [5],
    6
);

/**
Constructor, prototype and methods test.
*/
tests.programs.ctor_proto = genProgTest(
    'programs/ctor_proto/ctor_proto.js',
    'test',
    [5],
    9
);

/**
Constructor and instanceof test
*/
tests.programs.ctor_instof = genProgTest(
    'programs/ctor_instof/ctor_instof.js',
    'test',
    [],
    0
);

/**
For-in loop, property enumeration.
*/
tests.programs.for_in = genProgTest(
    'programs/for_in/for_in.js',
    'test',
    [],
    0
);

/**
Variable number of arguments test.
*/
tests.programs.var_args = genProgTest(
    'programs/var_args/var_args.js',
    'foo_proxy',
    [],
    0
);

/**
Arguments object test.
*/
tests.programs.arg_obj = genProgTest(
    'programs/arg_obj/arg_obj.js',
    'foo_proxy',
    [],
    0,
    'hostParams'
);

/**
Low-level apply function call test
*/
tests.programs.apply_iir = genProgTest(
    'programs/apply_iir/apply_iir.js',
    'test',
    [],
    0,
    'hostParams'
);

/**
Standard library initialization
*/
tests.programs.initStdlib = function ()
{
    // Initialize the Tachyon standard library
    initStdlib(config.hostParams);

    reportPerformance();
};

/**
Object access runtime primitives test.
*/
tests.programs.obj_prims = genProgTest(
    'programs/obj_prims/obj_prims.js',
    'test',
    [],
    0
);

/**
Constructor, prototype and toString method test.
*/
tests.programs.obj_tostring = genProgTest(
    'programs/obj_tostring/obj_tostring.js',
    'test',
    [],
    0
);

/**
Test of the use of objects as properties.
*/
tests.programs.obj_objprops = genProgTest(
    'programs/obj_objprops/obj_objprops.js',
    'test',
    [],
    0
);

/**
Bubble-sort implementation. Uses closures and string conversion of arrays.
*/
tests.programs.bubble_sort = genProgTest(
    'programs/bubble_sort/bubble_sort.js',
    'test',
    [],
    0
);

/**
Function apply test.
*/
tests.programs.apply = genProgTest(
    'programs/apply/apply.js',
    'foo_proxy',
    [],
    0,
    'hostParams'
);

/**
Matrix computations, uses arrays, constructors, strings, closures.
*/
tests.programs.matrix_comp = genProgTest(
    'programs/matrix_comp/matrix_comp.js',
    'test',
    [],
    10
);

/**
Standard conformance test for comparison operators.
*/
tests.programs.es5_cmp = genProgTest(
    'programs/es5_cmp/es5_cmp.js',
    'test',
    [],
    0
);

/**
Standard library global code tests.
*/
/*
FIXME: currently disabled
tests.programs.stdlib_global = genProgTest(
    'programs/stdlib_global/stdlib_global.js',
    'test',
    [],
    0
);
*/

/**
Standard library objects code tests.
*/
tests.programs.stdlib_object = genProgTest(
    'programs/stdlib_object/stdlib_object.js',
    'test',
    [],
    0
);

/**
Standard library function code tests.
*/
tests.programs.stdlib_function = genProgTest(
    'programs/stdlib_function/stdlib_function.js',
    'test',
    [],
    0
);

/**
Standard library array code tests.
*/
tests.programs.stdlib_array = genProgTest(
    'programs/stdlib_array/stdlib_array.js',
    'test',
    [],
    0
);

/**
Standard library boolean code tests.
*/
tests.programs.stdlib_boolean = genProgTest(
    'programs/stdlib_boolean/stdlib_boolean.js',
    'test',
    [],
    0
);

/**
Standard library number code tests.
*/
tests.programs.stdlib_number = genProgTest(
    'programs/stdlib_number/stdlib_number.js',
    'test',
    [],
    0
);

/**
Standard library string code tests.
*/
tests.programs.stdlib_string = genProgTest(
    'programs/stdlib_string/stdlib_string.js',
    'test',
    [],
    0
);

/**
Standard library regexp code tests.
*/
tests.programs.stdlib_regexp = genProgTest(
    'programs/stdlib_regexp/stdlib_regexp.js',
    'test',
    [],
    0
);

/**
Standard library math code tests.
*/
tests.programs.stdlib_math = genProgTest(
    'programs/stdlib_math/stdlib_math.js',
    'test',
    [],
    0
);

/**
Standard library json code tests.
*/
tests.programs.stdlib_json = genProgTest(
    'programs/stdlib_json/stdlib_json.js',
    'test',
    [],
    0
);

/**
Simple object access performance test.
*/
tests.programs.perf_obj_access = genProgTest(
    'programs/perf_obj_access/perf_obj_access.js',
    'test',
    [],
    0
);

/**
Simple array access performance test.
*/
tests.programs.perf_arr_access = genProgTest(
    'programs/perf_arr_access/perf_arr_access.js',
    'test',
    [],
    0
);

/**
Tests for sunspider.
*/
tests.programs.sunspider = tests.testSuite();
tests.programs.sunspider['access-binary-trees'] = genProgTest(
    'programs/sunspider/access-binary-trees.js'
);
tests.programs.sunspider['access-fannkuch'] = genProgTest(
    'programs/sunspider/access-fannkuch.js'
);
tests.programs.sunspider['access-nsieve'] = genProgTest(
    'programs/sunspider/access-nsieve.js'
);
tests.programs.sunspider['bitops-3bit-bits-in-byte'] = genProgTest(
    'programs/sunspider/bitops-3bit-bits-in-byte.js'
);
tests.programs.sunspider['bitops-bits-in-byte'] = genProgTest(
    'programs/sunspider/bitops-bits-in-byte.js'
);
/* Only works in 64-bit for now
tests.programs.sunspider['bitops-bitwise-and'] = genProgTest(
    'programs/sunspider/bitops-bitwise-and.js'
);
*/
/* Only works in 64-bit for now
tests.programs.sunspider['bitops-nsieve-bits'] = genProgTest(
    'programs/sunspider/bitops-nsieve-bits.js'
);
*/
tests.programs.sunspider['controlflow-recursive'] = genProgTest(
    'programs/sunspider/controlflow-recursive.js'
);
/* Only works in 64-bit for now
tests.programs.sunspider['crypto-md5'] = genProgTest(
    'programs/sunspider/crypto-md5.js'
);
*/
/* Only works in 64-bit for now
tests.programs.sunspider['crypto-sha1'] = genProgTest(
    'programs/sunspider/crypto-sha1.js'
);
*/
/* Uses Math.random 
tests.programs.sunspider['string-base64'] = genProgTest(
    'programs/sunspider/string-base64.js'
);*/

/**
V8 benchmark suite
*/
tests.programs.v8bench = tests.testSuite();
/*
//FIXME: requires int32/FP support
//FIXME: requires Math.random (FP support)
tests.programs.v8bench['crypto'] = genProgTest(
    ['programs/v8bench/base.js',
     'programs/v8bench/crypto.js',
     'drv-crypto']
);
*/
tests.programs.v8bench['deltablue'] = genProgTest(
    ['programs/v8bench/base.js',
     'programs/v8bench/deltablue.js',
     'programs/v8bench/drv-deltablue.js']
);
/*
//FIXME: requires Math.random (FP support)
tests.programs.v8bench['earley-boyer'] = genProgTest(
    ['programs/v8bench/base.js',
     'programs/v8bench/earley-boyer.js',
     'programs/v8bench/drv-earley-boyer.js']
);
*/
/*
// FIXME: requires FP support
tests.programs.v8bench['navier-stokes'] = genProgTest(
    ['programs/v8bench/base.js',
     'programs/v8bench/navier-stokes.js',
     'programs/v8bench/drv-navier-stokes.js']
);
*/
/*
// FIXME: requires FP support
tests.programs.v8bench['raytrace'] = genProgTest(
    ['programs/v8bench/base.js',
     'programs/v8bench/raytrace.js',
     'renderScene']
);
*/
/*
//FIXME: requires Math.random (FP support)
tests.programs.v8bench['regexp'] = genProgTest(
    ['programs/v8bench/base.js',
     'programs/v8bench/regexp.js',
     'programs/v8bench/drv-regexp.js']
);
*/
tests.programs.v8bench['richards'] = genProgTest(
    ['programs/v8bench/base.js',
     'programs/v8bench/richards.js',
     'programs/v8bench/drv-richards.js']
);
/*
//FIXME: requires Math.random (FP support)
tests.programs.v8bench['splay'] = genProgTest(
    ['programs/v8bench/base.js',
     'programs/v8bench/splay.js',
     'programs/v8bench/drv-splay.js',
     'runSplayBenchmark']
);
*/

/**
Tachyon hash map utility code test
*/
tests.programs.tachyon_hashmap = genProgTest(
    [
        'utility/debug.js',
        'utility/hashmap.js',
        'programs/tachyon_hashmap/tachyon_hashmap.js'
    ],
    'test',
    [],
    0
);

/**
Tachyon graph utility code test
*/
tests.programs.tachyon_graph = genProgTest(
    [
        'utility/debug.js',
        'utility/iterators.js',
        'utility/arrays.js',
        'utility/graph.js',
        'programs/tachyon_graph/tachyon_graph.js'
    ],
    'test',
    [],
    0/*,
    'clientDebugParams'*/
);

/**
Tachyon bignum utility code test
*/
tests.programs.tachyon_num = genProgTest(
    [
        'utility/debug.js',
        'utility/num.js',
        'utility/misc.js',
        'programs/tachyon_num/tachyon_num.js'
    ],
    'test',
    [],
    0
);

/**
Tachyon machine code block test code.
*/
tests.programs.tachyon_mcb = genProgTest(
    [
        'utility/debug.js',
        'platform/mcb.js',
        'programs/tachyon_mcb/tachyon_mcb.js'
    ],
    'test',
    [],
    0,
    'hostParams'
);

/**
Tachyon bridge test code.
*/
tests.programs.tachyon_bridge = genProgTest(
    [
        'programs/tachyon_bridge/tachyon_bridge.js',
        'utility/debug.js',
        'ir/types.js',
        'platform/ffi.js',
        'platform/mcb.js',
    ],
    'test',
    [],
    0,
    'hostParams'
);

/**
Garbage collector tests
*/
tests.programs.gc = tests.testSuite();
tests.programs.gc.walk_stack = genProgTest(
    'programs/gc/walk_stack.js',
    'test',
    [],
    0,
    'hostParams'
);
tests.programs.gc.collect = genProgTest(
    'programs/gc/collect.js',
    'test',
    [],
    0,
    'hostParams'
);
tests.programs.gc.deepstack = genProgTest(
    'programs/gc/deepstack.js',
    'test',
    [],
    0,
    'hostParams'
);
tests.programs.gc.apply = genProgTest(
    'programs/gc/apply.js',
    'test',
    [],
    0,
    'hostParams'
);
tests.programs.gc.arguments = genProgTest(
    'programs/gc/arguments.js',
    'test',
    [],
    0,
    'hostParams'
);
tests.programs.gc.arrays = genProgTest(
    'programs/gc/arrays.js',
    'test',
    [],
    0,
    'hostParams'
);
tests.programs.gc.graph = genProgTest(
    'programs/gc/graph.js',
    'test',
    [],
    0,
    'hostParams'
);
tests.programs.gc.stackvm = genProgTest(
    'programs/gc/stackvm.js',
    'test',
    [],
    0,
    'hostParams'
);

/**
Esprima parser test
*/
tests.programs.esprima = genProgTest(
    [
        'programs/esprima/esprima.js',
        'programs/esprima/harness.js'
    ],
    'test',
    [],
    0,
    'clientParams'
);

/*
Type analysis test programs. This test suite is auto-filled
by the type analysis tests.
*/
tests.programs.type_analysis = tests.testSuite();

/**
Print the state of the Tachyon VM.
*/
tests.programs.tachyon_state = genProgTest(
    'programs/tachyon_state/tachyon_state.js',
    'printState',
    [],
    0,
    'hostParams'
);

